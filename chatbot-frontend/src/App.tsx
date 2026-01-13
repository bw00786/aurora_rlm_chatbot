// src/App.tsx

import { useState, useEffect, useRef } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "./components/Header";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import { ReasoningDrawer } from "./components/ReasoningDrawer";
import PlannerDrawer from "./components/PlannerDrawer";
import { EmptyState } from "./components/EmptyState";
import { streamChat, getHealth, clearDatabase } from "./api/chatApi";
import { ChatMessage } from "./types/chat";
import { PdfUploadButton } from "./components/PdfUploadButton";

const queryClient = new QueryClient();

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [recursive, setRecursive] = useState(true);
  const [health, setHealth] = useState<any>(null);
  
  // Drawers
  const [reasoningDrawerOpen, setReasoningDrawerOpen] = useState(false);
  const [plannerDrawerOpen, setPlannerDrawerOpen] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState<any[]>([]);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#667eea",
      },
      secondary: {
        main: "#764ba2",
      },
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const status = await getHealth();
        setHealth(status);
      } catch (error) {
        console.error("Health check failed:", error);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    // Clear input immediately
    setInput("");

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Create placeholder for assistant message
    const assistantMessageIndex = messages.length + 1;
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      sources: [],
      reasoning_steps: [],
    };
    setMessages((prev) => [...prev, assistantMessage]);

    setIsStreaming(true);

    try {
      let accumulatedText = "";
      let sources: string[] = [];
      let reasoning: any[] = [];

      await streamChat(text, recursive, 3, {
        onStatus: (status) => {
          console.log("Status:", status);
        },
        onSources: (srcs) => {
          sources = srcs;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                sources: srcs,
              };
            }
            return updated;
          });
        },
        onReasoning: (steps) => {
          reasoning = steps;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                reasoning_steps: steps,
              };
            }
            return updated;
          });
        },
        onToken: (token) => {
          accumulatedText += token;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMessageIndex]) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content: accumulatedText,
              };
            }
            return updated;
          });
        },
        onDone: () => {
          console.log("Streaming complete");
        },
        onError: (error) => {
          setSnackbar({
            open: true,
            message: `Error: ${error}`,
            severity: "error",
          });
        },
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to send message",
        severity: "error",
      });
      
      // Remove the failed assistant message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearConversation = async () => {
    try {
      await clearDatabase();
      setMessages([]);
      setSnackbar({
        open: true,
        message: "Database cleared successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to clear database",
        severity: "error",
      });
    }
  };

  const handleShowReasoning = (steps: any[]) => {
    setCurrentReasoning(steps);
    setReasoningDrawerOpen(true);
  };

  const handleUploadSuccess = () => {
    setSnackbar({
      open: true,
      message: "PDFs uploaded successfully!",
      severity: "success",
    });
    
    // Refresh health to get updated document count
    getHealth().then(setHealth);
  };

  const handleMic = () => {
    // Implement your speech recognition logic here
    console.log("Mic clicked");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
          <Header
            health={health}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
            recursive={recursive}
            onToggleRecursive={() => setRecursive(!recursive)}
            onOpenPlanner={() => setPlannerDrawerOpen(true)}
            onUpload={handleUploadSuccess}
            onClear={handleClearConversation}
          />

          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              position: "relative",
            }}
          >
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <MessageList
                  messages={messages}
                  onShowReasoning={handleShowReasoning}
                />
                <div ref={messagesEndRef} />
              </>
            )}
          </Box>

          <ChatInput
            value={input}
            disabled={isStreaming}
            isListening={false}
            onChange={setInput}
            onSend={handleSend}
            onMic={handleMic}
          />

          {/* Upload Button (Floating) */}
          <Box
            sx={{
              position: "fixed",
              bottom: 80,
              right: 20,
              zIndex: 1000,
            }}
          >
            <PdfUploadButton onSuccess={handleUploadSuccess} />
          </Box>

          {/* Reasoning Drawer */}
          <ReasoningDrawer
            open={reasoningDrawerOpen}
            onClose={() => setReasoningDrawerOpen(false)}
            steps={currentReasoning}
          />

          {/* Planner Drawer */}
          <PlannerDrawer
            open={plannerDrawerOpen}
            onClose={() => setPlannerDrawerOpen(false)}
            plan={[]}
            steps={[]}
          />

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;