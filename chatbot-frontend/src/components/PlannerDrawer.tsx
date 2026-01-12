import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent
} from "@mui/lab";

interface AgentStep {
  agent: string;
  output: string;
}

interface PlannerDrawerProps {
  open: boolean;
  onClose: () => void;
  plan: string[];
  steps: AgentStep[];
}

export default function PlannerDrawer({
  open,
  onClose,
  plan,
  steps
}: PlannerDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 420 } }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1.5}
      >
        <Typography fontWeight={600}>Agent Planner</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Plan */}
      <Box px={2} py={2}>
        <Typography variant="subtitle2" gutterBottom>
          Plan
        </Typography>

        <Timeline>
          {plan.map((p, i) => (
            <TimelineItem key={i}>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                {i < plan.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography>{p}</Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>

      <Divider />

      {/* Execution */}
      <Box px={2} py={2}>
        <Typography variant="subtitle2" gutterBottom>
          Execution
        </Typography>

        <Timeline>
          {steps.map((s, i) => (
            <TimelineItem key={i}>
              <TimelineSeparator>
                <TimelineDot variant="outlined" />
                {i < steps.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography fontWeight={600}>{s.agent}</Typography>
                <Typography variant="body2">{s.output}</Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Drawer>
  );
}
