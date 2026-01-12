import { useState } from "react";
import { useRef } from "react";
import { usePdfUpload } from "./hooks/usePdfUpload";
import { Snackbar } from "@mui/material";

import {
  ThemeProvider,
  CssBaseline,
  Box
} from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { lightTheme, darkTheme } from "./theme/theme";

import { Header } from "./components/Header";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import { ReasoningDrawer } from "./components/ReasoningDrawer";
import PlannerDrawer from "./components/PlannerDrawer";
import PdfDrawer from "./components/PdfDrawer";
import { HealthStatus } from "./types/chat";
import { useChatStore } from "./store/chatStore";
import { useChat, useHealth } from "./hooks/useChatApi";
import { useStreamingChat } from "./hooks/useStreamingChat";

const queryClient = new QueryClient();

export default function App() {
  /* ---------------- Theme ---------------- */
  const [darkMode, setDarkMode] = useState(false);

  /* ---------------- Recursive Reasoning ---------------- */
  const [recursive, setRecursive] = useState(true);
  const [snack, setSnack] = useState<string | null>(null);
  const health = useHealth();
 

  /* ---------------- Drawers ---------------- */
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  

  /* ---------------- Drawer Data ---------------- */
  const [activeReasoning, setActiveReasoning] = useState<any[]>([]);
  const [plan, setPlan] = useState<string[]>([]);
  const [agentSteps, setAgentSteps] = useState<any[]>([]);
  const [pdfState, setPdfState] = useState({
    pdfUrl: "",
    page: 1,
    chunkText: ""
  });

  /* ---------------- Chat Store ---------------- */
  const {
    messages,
    addMessage,
    updateLastAssistant,
    clear
  } = useChatStore();

  /* ---------------- Streaming Hook ---------------- */
  const { stream } = useStreamingChat();
  const fileInputRef = useRef<HTMLInputElement>(null);
 const uploadMutation = usePdfUpload();


  

  /* ---------------- Send Message ---------------- */
  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // User message
    addMessage({ role: "user", content: text });

    // Empty assistant for streaming
    addMessage({ role: "assistant", content: "" });

    let accumulated = "";

    await stream(
      {
        message: text,
        use_recursive: recursive,
        history: messages.map(({ role, content }) => ({ role, content }))
      },
      (token: string) => {
        accumulated += token;
        updateLastAssistant(accumulated);
      },
      (finalData: any) => {
        updateLastAssistant(accumulated, {
          reasoning: finalData.reasoning_steps,
          sources: finalData.sources
        });

        setActiveReasoning(finalData.reasoning_steps || []);
        setPlan(finalData.plan || []);
        setAgentSteps(finalData.steps || []);
      }
    );
  };
  const handleUploadClick = () => {
  fileInputRef.current?.click();
};

const handleFilesSelected = (files: FileList | null) => {
  if (!files || files.length === 0) return;

  uploadMutation.mutate(Array.from(files), {

    onSuccess: () => {
      setSnack("PDFs uploaded and indexed successfully");
    },
    onError: () => {
      setSnack("PDF upload failed");
    }
  });
};


  /* ---------------- PDF Source Open ---------------- */
  const openPdf = (source: any) => {
    setPdfState({
      pdfUrl: `/pdfs/${source.doc_id}`,
      page: source.page,
      chunkText: source.text
    });
    setPdfOpen(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />

        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default"
          }}
        >
          {/* ---------- Header ---------- */}
         <Header
            health={health.data}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
            recursive={recursive}
            onToggleRecursive={() => setRecursive((r) => !r)}
            onOpenPlanner={() => setPlannerOpen(true)}
            onUpload={handleUploadClick}   // ✅ FIXED
            onClear={clear}
          />



          {/* ---------- Messages ---------- */}
          <Box flex={1} overflow="auto">
            <MessageList
              messages={messages}
              onShowReasoning={(steps) => {
                setActiveReasoning(steps);
                setReasoningOpen(true);
              }}
              onOpenSource={openPdf}
            />
          </Box>

          {/* ---------- Input ---------- */}
          <ChatInput onSend={handleSend} />

          {/* ---------- Drawers ---------- */}
          <ReasoningDrawer
            open={reasoningOpen}
            onClose={() => setReasoningOpen(false)}
            steps={activeReasoning}
          />
          <Snackbar
             open={!!snack}
             autoHideDuration={3000}
             message={snack}
             onClose={() => setSnack(null)}
          />

          <PlannerDrawer
            open={plannerOpen}
            onClose={() => setPlannerOpen(false)}
            plan={plan}
            steps={agentSteps}
          />
          <input
             ref={fileInputRef}
             type="file"
             accept="application/pdf"
             multiple
             hidden
             onChange={(e) => handleFilesSelected(e.target.files)}
         />

          <PdfDrawer
            open={pdfOpen}
            onClose={() => setPdfOpen(false)}
            pdfUrl={pdfState.pdfUrl}
            page={pdfState.page}
            chunkText={pdfState.chunkText}
          />
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
