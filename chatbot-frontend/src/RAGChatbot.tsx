import { useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Header } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { getTheme } from "./theme/theme";
import { ChatMessage } from "./types/chat";
import { useChat, useHealth } from "./hooks/useChatApi";

const queryClient = new QueryClient();

export default function RAGChatbot() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showReasoning] = useState(true);
  const [snack, setSnack] = useState<string | null>(null);

  const health = useHealth();
  const chat = useChat();

  const send = async () => {
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      const res = await chat.mutateAsync({
        message: input,
        conversation_history: messages,
        use_recursive: true
      });

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.response,
          reasoning_steps: res.reasoning_steps
        }
      ]);
    } catch {
      setSnack("Chat failed. Check backend.");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={getTheme(darkMode ? "dark" : "light")}>
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          <Header
            health={health.data}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
            onUpload={() => setSnack("Upload not wired yet")}
            onClear={() => setMessages([])}
          />

          <MessageList messages={messages} showReasoning={showReasoning} />

          <ChatInput
            value={input}
            disabled={chat.isPending}
            isListening={false}
            onChange={setInput}
            onSend={send}
            onMic={() => setSnack("Voice input not wired")}
          />

          <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)}>
            <Alert severity="info">{snack}</Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
