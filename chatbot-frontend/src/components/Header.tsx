import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  Tooltip,
  Chip
} from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CircleIcon from "@mui/icons-material/Circle";
import { HealthStatus } from "../types/chat";



interface Props {
  health?: HealthStatus;
  darkMode: boolean;
  onToggleTheme: () => void;

  /* ✅ ADD THESE */
  recursive: boolean;
  onToggleRecursive: () => void;
  onOpenPlanner: () => void;

  onUpload?: () => void;
  onClear: () => void;
}

export function Header({
  health,
  darkMode,
  onToggleTheme,
  recursive,
  onToggleRecursive,
  onOpenPlanner,
  onUpload,
  onClear
}: Props) {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Title */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Aurora RAG Chat
        </Typography>

        {/* Health */}
        {health && (
          <Chip
            size="small"
            icon={
              <CircleIcon
                sx={{
                 color: health.status === "healthy" ? "limegreen" : "red"
                }}
              />
            }
            label={health.status.toUpperCase()}
            sx={{ mr: 2 }}
          />
        )}

        {/* Recursive reasoning toggle */}
        <Tooltip title="Recursive reasoning">
          <Switch checked={recursive} onChange={onToggleRecursive} />
        </Tooltip>

        {/* Planner / agent view */}
        <Tooltip title="Planner / Agent view">
          <IconButton onClick={onOpenPlanner} color="inherit">
            <PsychologyIcon />
          </IconButton>
        </Tooltip>

        {/* Upload */}
        {onUpload && (
          <Tooltip title="Upload PDFs">
            <IconButton onClick={onUpload} color="inherit">
              <CloudUploadIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Clear */}
        <Tooltip title="Clear conversation">
          <IconButton onClick={onClear} color="inherit">
            <DeleteIcon />
          </IconButton>
        </Tooltip>

        {/* Dark mode */}
        <Tooltip title="Toggle theme">
          <Switch checked={darkMode} onChange={onToggleTheme} />
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
