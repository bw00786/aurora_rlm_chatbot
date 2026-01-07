import {
  Drawer,
  Typography,
  Box,
  Divider
} from "@mui/material";
import { ReasoningStep } from "../types/chat";

export function ReasoningDrawer({
  open,
  onClose,
  steps
}: {
  open: boolean;
  onClose: () => void;
  steps: ReasoningStep[];
}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, p: 2 }}>
        <Typography variant="h6">Reasoning Inspector</Typography>
        <Divider sx={{ my: 1 }} />
        {steps.map((s, i) => (
          <Box key={i} mb={1}>
            <Typography variant="caption">
              {s.type} (depth {s.depth ?? 0})
            </Typography>
            {s.query && <Typography>{s.query}</Typography>}
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}
