import { useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { chatRequest } from "./api/chatApi";
import { usePersistedChat } from "./hooks/usePersistedChat";
import { useSpeech } from "./hooks/useSpeech";
import { ReasoningDrawer } from "./components/ReasoningDrawer";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./types/chat";


const client = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <ChatApp />
    </QueryClientProvider>
  );
}

function ChatApp() {
  const { messages, setMessages } = usePersistedChat();
  const [input, setInput] = useState("");
  const [snack, setSnack] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const chat = useMutation({ mutationFn: chatRequest });
  const speech = useSpeech(setInput);

  const send = async () => {
   const user: ChatMessage = {
      role: "user",
      content: input
  };
    setMessages(m => [
  ...m,
  { role: "user" as const, content: input }
]);
    setInput("");

    try {
      const res = await chat.mutateAsync({
        message: input,
        conversation_history: messages,
        use_recursive: true
      });

      const assistant: ChatMessage = {
  role: "assistant",
  content: res.response,
  reasoning_steps: res.reasoning_steps
};
 setMessages(m => [...m, assistant]);
    } catch {
      setSnack("Chat failed");
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <MessageList messages={messages} showReasoning />
      <ChatInput
        value={input}
        isListening={speech.listening}
        disabled={chat.isPending}
        onChange={setInput}
        onSend={send}
        onMic={() => (speech.listening ? speech.stop() : speech.start())}
      />

      <ReasoningDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        steps={messages.at(-1)?.reasoning_steps ?? []}
      />

      <Snackbar open={!!snack} onClose={() => setSnack(null)}>
        <Alert severity="error">{snack}</Alert>
      </Snackbar>
    </Box>
  );
}
