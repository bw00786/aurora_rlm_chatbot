// src/components/ChatInput.tsx

import { Box, IconButton, TextField, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import { Dispatch, SetStateAction } from "react";

interface ChatInputProps {
  value: string;
  disabled?: boolean;
  isListening?: boolean;
  onChange: Dispatch<SetStateAction<string>>;
  onSend: () => void | Promise<void>;
  onMic?: () => void;
}

export default function ChatInput({ 
  value,
  disabled = false,
  isListening = false,
  onChange,
  onSend,
  onMic
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box
      display="flex"
      gap={1}
      p={2}
      sx={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        zIndex: 100,
      }}
    >
      {onMic && (
        <IconButton 
          onClick={onMic}
          disabled={disabled}
          color={isListening ? "error" : "primary"}
        >
          <MicIcon />
        </IconButton>
      )}
      
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "Generating response..." : "Type your message or use voice..."}
        disabled={disabled}
        multiline
        maxRows={4}
        variant="outlined"
      />
      
      <IconButton
        onClick={onSend}
        disabled={disabled || !value.trim()}
        color="primary"
      >
        {disabled ? <CircularProgress size={24} /> : <SendIcon />}
      </IconButton>
    </Box>
  );
}