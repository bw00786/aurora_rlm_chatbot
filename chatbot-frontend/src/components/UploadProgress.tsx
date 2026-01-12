import { Box, LinearProgress, Typography } from "@mui/material";


interface Props {
progress: number;
visible: boolean;
}


export default function UploadProgress({ progress, visible }: Props) {
if (!visible) return null;


return (
<Box sx={{ px: 3, py: 1 }}>
<Typography variant="caption" color="text.secondary">
Uploading PDFs… {progress}%
</Typography>
<LinearProgress
variant="determinate"
value={progress}
sx={{ height: 6, borderRadius: 3 }}
/>
</Box>
);
}