import ollama
import json
import re

# Simple todo list tool
class TodoTool:
    def __init__(self):
        self.todos = []
    
    def add_todo(self, task):
        self.todos.append({"id": len(self.todos) + 1, "task": task, "done": False})
        return f"Added todo: {task}"
    
    def list_todos(self):
        if not self.todos:
            return "No todos found"
        result = "Current todos:\n"
        for todo in self.todos:
            status = "✓" if todo["done"] else "○"
            result += f"{status} {todo['id']}. {todo['task']}\n"
        return result
    
    def complete_todo(self, todo_id):
        for todo in self.todos:
            if todo["id"] == todo_id:
                todo["done"] = True
                return f"Completed todo: {todo['task']}"
        return f"Todo {todo_id} not found"
    
    def delete_todo(self, todo_id):
        for i, todo in enumerate(self.todos):
            if todo["id"] == todo_id:
                deleted = self.todos.pop(i)
                return f"Deleted todo: {deleted['task']}"
        return f"Todo {todo_id} not found"

# Tool registry
TOOLS = {
    "add_todo": {
        "description": "Add a new todo item",
        "parameters": {"task": "string - the task description"}
    },
    "list_todos": {
        "description": "List all todo items",
        "parameters": {}
    },
    "complete_todo": {
        "description": "Mark a todo as complete",
        "parameters": {"todo_id": "integer - the ID of the todo"}
    },
    "delete_todo": {
        "description": "Delete a todo item",
        "parameters": {"todo_id": "integer - the ID of the todo"}
    }
}

class ReACTAgent:
    def __init__(self, model="gemma3"):
        self.model = model
        self.todo_tool = TodoTool()
        self.max_iterations = 10
    
    def execute_tool(self, tool_name, parameters):
        """Execute a tool and return the observation"""
        if tool_name == "add_todo":
            return self.todo_tool.add_todo(parameters.get("task", ""))
        elif tool_name == "list_todos":
            return self.todo_tool.list_todos()
        elif tool_name == "complete_todo":
            return self.todo_tool.complete_todo(parameters.get("todo_id", 0))
        elif tool_name == "delete_todo":
            return self.todo_tool.delete_todo(parameters.get("todo_id", 0))
        else:
            return f"Unknown tool: {tool_name}"
    
    def parse_action(self, text):
        """Parse action from the model's response"""
        # Look for Action: tool_name(parameters)
        action_match = re.search(r'Action:\s*(\w+)\((.*?)\)', text, re.IGNORECASE)
        if action_match:
            tool_name = action_match.group(1)
            params_str = action_match.group(2)
            
            # Parse parameters
            parameters = {}
            if params_str.strip():
                # Simple parsing for key=value pairs
                for param in params_str.split(','):
                    if '=' in param:
                        key, value = param.split('=', 1)
                        key = key.strip()
                        value = value.strip().strip('"\'')
                        # Try to convert to int if possible
                        try:
                            value = int(value)
                        except ValueError:
                            pass
                        parameters[key] = value
            
            return tool_name, parameters
        
        # Check for final answer
        if "Final Answer:" in text:
            return "final_answer", {"answer": text.split("Final Answer:", 1)[1].strip()}
        
        return None, None
    
    def create_prompt(self, question, history):
        """Create the ReACT prompt"""
        tools_desc = "\n".join([f"- {name}: {info['description']}" for name, info in TOOLS.items()])
        
        prompt = f"""You are a helpful AI assistant that uses tools to help users. You should think step-by-step using the ReACT (Reasoning and Acting) framework.

Available tools:
{tools_desc}

Format your response as follows:
Thought: [Your reasoning about what to do next]
Action: tool_name(param1="value1", param2="value2")

After receiving an observation, continue with:
Thought: [Your reasoning about the observation]
Action: [Next action] OR Final Answer: [Your final response]

Question: {question}

{history}"""
        return prompt
    
    def run(self, question):
        """Run the ReACT loop"""
        history = ""
        
        print(f"\n{'='*60}")
        print(f"Question: {question}")
        print(f"{'='*60}\n")
        
        for iteration in range(self.max_iterations):
            # Generate response
            prompt = self.create_prompt(question, history)
            response = ollama.generate(model=self.model, prompt=prompt)
            model_output = response['response']
            
            print(f"Iteration {iteration + 1}:")
            print(model_output)
            print()
            
            # Parse action
            tool_name, parameters = self.parse_action(model_output)
            
            if tool_name == "final_answer":
                print(f"{'='*60}")
                print(f"Final Answer: {parameters['answer']}")
                print(f"{'='*60}\n")
                return parameters['answer']
            
            if tool_name and tool_name in TOOLS:
                # Execute tool
                observation = self.execute_tool(tool_name, parameters)
                print(f"Observation: {observation}\n")
                
                # Add to history
                history += f"\n{model_output}\nObservation: {observation}\n"
            else:
                # If no valid action, add response to history and continue
                history += f"\n{model_output}\n"
        
        return "Max iterations reached without final answer"

# Example usage
if __name__ == "__main__":
    agent = ReACTAgent(model="gemma3")  # Change to your model
    
    # Example queries
    queries = [
        "Add three tasks: buy groceries, finish report, and call dentist",
        "Show me all my todos",
        "Mark todo number 2 as complete",
        "What tasks do I still need to do?"
    ]
    
    for query in queries:
        agent.run(query)
        print("\n" + "="*60 + "\n")