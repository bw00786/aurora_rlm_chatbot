import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { ChatMessage } from "../store/chatStore";

interface Props {
  messages: ChatMessage[];
  onShowReasoning?: (steps: any[]) => void;
  onOpenSource?: (source: any) => void;
}

export default function MessageList({
  messages,
  onShowReasoning,
  onOpenSource
}: Props) {
  return (
    <Box px={2} pb={10}>
      {messages.map((m, i) => (
        <Box
          key={i}
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          mb={2}
          p={2}
          maxWidth="85%"
          alignSelf={m.role === "user" ? "flex-end" : "flex-start"}
          borderRadius={3}
          bgcolor={m.role === "user" ? "primary.main" : "grey.100"}
          color={m.role === "user" ? "white" : "black"}
        >
          <Typography whiteSpace="pre-wrap">
            {m.content}
          </Typography>

          {/* ---------- Reasoning ---------- */}
          {m.reasoning && onShowReasoning && (
            <Chip
              size="small"
              label="View reasoning"
              sx={{ mt: 1 }}
              onClick={() => onShowReasoning(m.reasoning!)}
            />
          )}

          {/* ---------- Sources ---------- */}
          {m.sources?.map((s, idx) => (
            <Chip
              key={idx}
              size="small"
              label={`Source ${idx + 1}`}
              sx={{ mt: 1, ml: 1 }}
              onClick={() => onOpenSource?.(s)}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

