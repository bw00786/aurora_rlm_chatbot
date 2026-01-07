import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Stack,
  Chip
} from "@mui/material";
import {
  Upload,
  Delete,
  Brightness4,
  Brightness7,
  HealthAndSafety
} from "@mui/icons-material";
import { HealthStatus } from "../types/chat";

interface Props {
  health?: HealthStatus;
  darkMode: boolean;
  onToggleTheme: () => void;
  onUpload: () => void;
  onClear: () => void;
}

export function Header({
  health,
  darkMode,
  onToggleTheme,
  onUpload,
  onClear
}: Props) {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          RAG Chatbot
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {health && (
            <Chip
              icon={<HealthAndSafety />}
              label={`${health.ollama} · ${health.documents_count ?? 0}`}
              color={health.status === "healthy" ? "success" : "error"}
            />
          )}

          <IconButton onClick={onUpload}>
            <Upload />
          </IconButton>

          <IconButton color="error" onClick={onClear}>
            <Delete />
          </IconButton>

          <IconButton onClick={onToggleTheme}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
