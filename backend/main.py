from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import chromadb
from chromadb.utils import embedding_functions
import PyPDF2
import io
import requests
import json
from pathlib import Path
import re

app = FastAPI(title="RAG Chatbot API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Create or get collection
collection = chroma_client.get_or_create_collection(
    name="pdf_documents",
    embedding_function=embedding_fn
)

# Models
class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []
    use_recursive: Optional[bool] = True
    max_recursion_depth: Optional[int] = 3

class ChatResponse(BaseModel):
    response: str
    sources: List[str]
    reasoning_steps: Optional[List[Dict]] = []
    recursion_depth: Optional[int] = 0

class RecursiveOllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "gemma3" \
        ""
        self.recursion_history = []
    
    def generate(self, prompt: str, system_context: str = "") -> str:
        """Generate response using Ollama"""
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "system": system_context,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                    }
                },
                timeout=120
            )
            response.raise_for_status()
            return response.json()["response"]
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Ollama API error: {str(e)}")
    
    def analyze_query_complexity(self, query: str) -> Dict:
        """Analyze if query needs recursive processing"""
        analysis_prompt = f"""Analyze this question and determine:
1. Does it require multiple steps to answer? (yes/no)
2. What sub-questions need to be answered first? (list them)
3. Is comparison or synthesis needed? (yes/no)

Question: {query}

Respond in this exact format:
NEEDS_RECURSION: yes/no
SUB_QUESTIONS: [list each on new line, or "none"]
NEEDS_SYNTHESIS: yes/no"""

        response = self.generate(analysis_prompt)
        
        # Parse the analysis
        needs_recursion = "yes" in response.lower().split("needs_recursion:")[1].split("\n")[0].lower()
        needs_synthesis = "yes" in response.lower().split("needs_synthesis:")[1].split("\n")[0].lower()
        
        # Extract sub-questions
        sub_questions = []
        try:
            sub_q_section = response.split("SUB_QUESTIONS:")[1].split("NEEDS_SYNTHESIS:")[0]
            sub_questions = [q.strip() for q in sub_q_section.split("\n") if q.strip() and q.strip() != "none"]
        except:
            pass
        
        return {
            "needs_recursion": needs_recursion,
            "sub_questions": sub_questions,
            "needs_synthesis": needs_synthesis
        }
    
    def recursive_generate(
        self, 
        query: str, 
        context: str, 
        depth: int = 0, 
        max_depth: int = 3,
        reasoning_steps: List[Dict] = None
    ) -> tuple[str, List[Dict]]:
        """
        Recursively process queries with self-reflection and refinement
        """
        if reasoning_steps is None:
            reasoning_steps = []
        
        # Base case: max depth reached
        if depth >= max_depth:
            step = {
                "depth": depth,
                "type": "final_answer",
                "query": query,
                "action": "Providing direct answer (max depth reached)"
            }
            reasoning_steps.append(step)
            
            final_prompt = f"""Context: {context}

Question: {query}

Provide a comprehensive answer based on the context."""
            
            answer = self.generate(final_prompt)
            return answer, reasoning_steps
        
        # Analyze if recursion is needed
        analysis = self.analyze_query_complexity(query)
        
        step = {
            "depth": depth,
            "type": "analysis",
            "query": query,
            "needs_recursion": analysis["needs_recursion"],
            "sub_questions": analysis["sub_questions"]
        }
        reasoning_steps.append(step)
        
        # If simple query, answer directly
        if not analysis["needs_recursion"] or not analysis["sub_questions"]:
            step = {
                "depth": depth,
                "type": "direct_answer",
                "query": query,
                "action": "Query is straightforward, answering directly"
            }
            reasoning_steps.append(step)
            
            direct_prompt = f"""Context: {context}

Question: {query}

Provide a clear and concise answer based on the context."""
            
            answer = self.generate(direct_prompt)
            return answer, reasoning_steps
        
        # Recursive case: break down and solve sub-questions
        sub_answers = []
        for i, sub_q in enumerate(analysis["sub_questions"][:3]):  # Limit to 3 sub-questions
            step = {
                "depth": depth + 1,
                "type": "sub_question",
                "query": sub_q,
                "action": f"Processing sub-question {i+1}/{len(analysis['sub_questions'][:3])}"
            }
            reasoning_steps.append(step)
            
            # Recursively answer sub-question
            sub_answer, reasoning_steps = self.recursive_generate(
                sub_q, 
                context, 
                depth + 1, 
                max_depth,
                reasoning_steps
            )
            sub_answers.append({
                "question": sub_q,
                "answer": sub_answer
            })
        
        # Synthesize all sub-answers
        step = {
            "depth": depth,
            "type": "synthesis",
            "query": query,
            "action": "Synthesizing sub-answers into final response"
        }
        reasoning_steps.append(step)
        
        synthesis_prompt = f"""Original Question: {query}

Context: {context}

Sub-questions and their answers:
{chr(10).join([f"Q: {sa['question']}\nA: {sa['answer']}\n" for sa in sub_answers])}

Now synthesize all the information above to provide a comprehensive answer to the original question. 
Make sure to integrate all the sub-answers coherently."""

        final_answer = self.generate(synthesis_prompt)
        
        # Self-reflection: verify answer quality
        if depth == 0:  # Only do reflection at top level
            reflection_prompt = f"""Review this answer for completeness and accuracy:

Question: {query}
Answer: {final_answer}
Context: {context}

Is this answer:
1. Complete? (addresses all parts of the question)
2. Accurate? (based on the context)
3. Clear? (well-organized and understandable)

If any issues, provide an improved version. If good, respond with: APPROVED"""

            reflection = self.generate(reflection_prompt)
            
            if "APPROVED" not in reflection:
                step = {
                    "depth": depth,
                    "type": "refinement",
                    "query": query,
                    "action": "Refining answer based on self-reflection"
                }
                reasoning_steps.append(step)
                
                # Extract improved answer from reflection
                final_answer = reflection
        
        return final_answer, reasoning_steps

ollama_client = RecursiveOllamaClient()

def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extract text from PDF file"""
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks"""
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
    
    return chunks

@app.get("/")
async def root():
    return {"message": "Recursive RAG Chatbot API is running"}

@app.post("/upload-pdfs/")
async def upload_pdfs(files: List[UploadFile] = File(...)):
    """Upload and process PDF documents"""
    try:
        total_chunks = 0
        
        for file in files:
            if not file.filename.endswith('.pdf'):
                continue
            
            # Read and extract text
            content = await file.read()
            text = extract_text_from_pdf(content)
            
            # Chunk the text
            chunks = chunk_text(text)
            
            # Add to ChromaDB
            ids = [f"{file.filename}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [{"source": file.filename, "chunk": i} for i in range(len(chunks))]
            
            collection.add(
                documents=chunks,
                ids=ids,
                metadatas=metadatas
            )
            
            total_chunks += len(chunks)
        
        return {
            "message": f"Successfully processed {len(files)} files",
            "total_chunks": total_chunks
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint with recursive RAG"""
    try:
        # Query ChromaDB for relevant documents
        results = collection.query(
            query_texts=[request.message],
            n_results=5
        )
        
        # Prepare context from retrieved documents
        context = "\n\n".join(results["documents"][0]) if results["documents"] else ""
        sources = [meta["source"] for meta in results["metadatas"][0]] if results["metadatas"] else []
        
        # Use recursive generation if enabled
        if request.use_recursive:
            response, reasoning_steps = ollama_client.recursive_generate(
                request.message, 
                context,
                max_depth=request.max_recursion_depth
            )
            
            return ChatResponse(
                response=response,
                sources=list(set(sources)),
                reasoning_steps=reasoning_steps,
                recursion_depth=len([s for s in reasoning_steps if s["type"] == "sub_question"])
            )
        else:
            # Standard non-recursive generation
            prompt = f"""Context: {context}

Question: {request.message}

Provide a clear answer based on the context."""
            
            response = ollama_client.generate(prompt)
            
            return ChatResponse(
                response=response,
                sources=list(set(sources)),
                reasoning_steps=[],
                recursion_depth=0
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health/")
async def health_check():
    """Check if Ollama is running"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        return {
            "status": "healthy",
            "ollama": "running",
            "documents_count": collection.count()
        }
    except:
        return {
            "status": "unhealthy",
            "ollama": "not running",
            "documents_count": collection.count()
        }

@app.delete("/clear-database/")
async def clear_database():
    """Clear all documents from the database"""
    try:
        chroma_client.delete_collection("pdf_documents")
        global collection
        collection = chroma_client.get_or_create_collection(
            name="pdf_documents",
            embedding_function=embedding_fn
        )
        return {"message": "Database cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)