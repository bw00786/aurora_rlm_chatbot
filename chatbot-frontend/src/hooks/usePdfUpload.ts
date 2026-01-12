import { useMutation } from "@tanstack/react-query";
import { api } from "../api/api";

export function usePdfUpload() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await api.post("/upload-pdfs/", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      return res.data;
    }
  });
}
