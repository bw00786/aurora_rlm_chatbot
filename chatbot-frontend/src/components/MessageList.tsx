// src/components/MessageList.tsx

import { Box, Typography, Chip, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { ChatMessage } from "../types/chat";
import ReactMarkdown from "react-markdown";

interface Props {
  messages: ChatMessage[];
  onShowReasoning?: (steps: any[]) => void;
  onOpenSource?: (source: any) => void;
}

// Format text with markdown-like syntax
function formatMessageContent(content: string) {
  // Convert **bold** to actual bold
  let formatted = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  
  // Convert bullet points to proper list items
  formatted = formatted.replace(/^\* (.+)$/gm, "<li>$1</li>");
  
  // Wrap consecutive list items in <ul>
  formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");
  
  return formatted;
}

export default function MessageList({
  messages,
  onShowReasoning,
  onOpenSource,
}: Props) {
  return (
    <Box px={2} pb={2}>
      {messages.map((m, i) => (
        <Box
          key={i}
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          mb={2}
          display="flex"
          justifyContent={m.role === "user" ? "flex-end" : "flex-start"}
        >
          <Paper
            elevation={m.role === "user" ? 3 : 1}
            sx={{
              p: 2,
              maxWidth: "85%",
              borderRadius: 3,
              bgcolor: m.role === "user" ? "primary.main" : "background.paper",
              color: m.role === "user" ? "white" : "text.primary",
            }}
          >
            {/* Message Content */}
            {m.role === "assistant" ? (
              <Box
                sx={{
                  "& p": { margin: "0 0 8px 0" },
                  "& ul": { 
                    marginLeft: "20px", 
                    marginBottom: "8px",
                    paddingLeft: "0"
                  },
                  "& li": { marginBottom: "4px" },
                  "& strong": { 
                    color: "primary.main",
                    fontWeight: 600
                  },
                }}
              >
                <ReactMarkdown>
                  {m.content}
                </ReactMarkdown>
              </Box>
            ) : (
              <Typography whiteSpace="pre-wrap">{m.content}</Typography>
            )}

            {/* Sources */}
            {m.sources && m.sources.length > 0 && (
              <Box mt={1.5} pt={1.5} borderTop={1} borderColor="divider">
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  📚 Sources:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                  {m.sources.map((s, idx) => (
                    <Chip
                      key={idx}
                      size="small"
                      label={s}
                      variant="outlined"
                      onClick={() => onOpenSource?.(s)}
                      sx={{ fontSize: "0.7rem" }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Reasoning Button */}
            {m.reasoning_steps && m.reasoning_steps.length > 0 && onShowReasoning && (
              <Box mt={1}>
                <Chip
                  size="small"
                  label={`🧠 View Reasoning (${m.reasoning_steps.length} steps)`}
                  onClick={() => onShowReasoning(m.reasoning_steps!)}
                  color="primary"
                  variant="outlined"
                  sx={{ cursor: "pointer" }}
                />
              </Box>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );
}