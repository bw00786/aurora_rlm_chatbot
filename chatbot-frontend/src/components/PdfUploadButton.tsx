import { IconButton } from "@mui/material";
import { Upload } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { uploadPdfs } from "../api/chatApi";

export function PdfUploadButton({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useMutation({ mutationFn: uploadPdfs });

  return (
    <>
     <input
  hidden
  type="file"
  multiple
  accept=".pdf"
  onChange={(e) => {
    if (!e.target.files) return;
    mutation.mutate(Array.from(e.target.files), { onSuccess });
  }}
  id="pdf-upload"
/>

      <label htmlFor="pdf-upload">
        <IconButton component="span">
          <Upload />
        </IconButton>
      </label>
    </>
  );
}
