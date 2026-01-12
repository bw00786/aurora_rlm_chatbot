import { Box, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

export function EmptyState() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#9aa4c7"
      }}
    >
      <ChatBubbleOutlineIcon sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h6">
        Upload PDFs and start chatting!
      </Typography>
    </Box>
  );
}
