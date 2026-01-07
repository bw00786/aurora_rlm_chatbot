import { Box, Paper, Typography, Fade, Collapse } from "@mui/material";
import { ChatMessage } from "../types/chat";

interface Props {
  messages: ChatMessage[];
  showReasoning: boolean;
}

export function MessageList({ messages, showReasoning }: Props) {
  return (
    <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
      {messages.map((msg, i) => (
        <Fade in key={i} timeout={400}>
          <Box
            sx={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              mb: 2
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: "70%",
                bgcolor: msg.role === "user" ? "primary.main" : "background.paper",
                color: msg.role === "user" ? "white" : "text.primary"
              }}
            >
              <Typography whiteSpace="pre-wrap">
                {msg.content}
              </Typography>

              <Collapse in={showReasoning && !!msg.reasoning_steps?.length}>
                <Box mt={2}>
                  <Typography variant="caption" fontWeight="bold">
                    Reasoning
                  </Typography>
                  {msg.reasoning_steps?.map((r, j) => (
                    <Typography key={j} variant="caption" display="block">
                      • {r.type}
                    </Typography>
                  ))}
                </Box>
              </Collapse>
            </Paper>
          </Box>
        </Fade>
      ))}
    </Box>
  );
}
