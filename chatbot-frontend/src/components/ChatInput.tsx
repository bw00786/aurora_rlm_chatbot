import { Box, IconButton, TextField } from "@mui/material";
import { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import { useSpeech } from "../hooks/useSpeech";


export default function ChatInput({ onSend }: any) {
const [text, setText] = useState("");
const speech = useSpeech(setText);


return (
<Box display="flex" gap={1} p={2} position="fixed" bottom={0} width="100%" bgcolor="background.paper">
<IconButton onClick={speech.start}><MicIcon /></IconButton>
<TextField fullWidth value={text} onChange={e => setText(e.target.value)} placeholder="Type your message or use voice..." />
<IconButton onClick={() => onSend(text)}><SendIcon /></IconButton>
</Box>
);
}

