import {
  Drawer,
  Box,
  Typography,
  useMediaQuery
} from "@mui/material";
import { Document, Page, pdfjs } from "react-pdf";
import { useTheme } from "@mui/material/styles";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  page: number;
  chunkText: string;
}

export default function PdfDrawer({
  open,
  onClose,
  pdfUrl,
  page,
  chunkText
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const highlightText = (text: string, highlight: string) => {
    if (!highlight || !text.includes(highlight)) return text;

    return text.replace(
      highlight,
      `<mark style="background:#ffeb3b;padding:0 2px;">${highlight}</mark>`
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 480,
          p: 2
        }
      }}
    >
      <Typography variant="h6" mb={2}>
        Source PDF
      </Typography>

      <Box
        sx={{
          overflow: "auto",
          height: "100%"
        }}
      >
        <Document file={pdfUrl}>
          <Page
            pageNumber={page}
            renderAnnotationLayer={false}
            renderTextLayer
            customTextRenderer={(textItem) =>
              highlightText(textItem.str, chunkText)
            }
            width={isMobile ? window.innerWidth - 40 : 440}
          />
        </Document>
      </Box>
    </Drawer>
  );
}

