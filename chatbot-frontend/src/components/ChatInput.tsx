import {
  Box,
  IconButton,
  TextField,
  Stack
} from "@mui/material";
import { Send, Mic, MicOff } from "@mui/icons-material";

interface Props {
  value: string;
  isListening: boolean;
  disabled: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
  onMic: () => void;
}

export function ChatInput({
  value,
  isListening,
  disabled,
  onChange,
  onSend,
  onMic
}: Props) {
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={2}>
        <IconButton color={isListening ? "error" : "default"} onClick={onMic}>
          {isListening ? <MicOff /> : <Mic />}
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message…"
        />

        <IconButton
          color="primary"
          disabled={disabled || !value.trim()}
          onClick={onSend}
        >
          <Send />
        </IconButton>
      </Stack>
    </Box>
  );
}
