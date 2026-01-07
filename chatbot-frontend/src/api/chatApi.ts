const API = "http://localhost:8000";

export async function chatRequest(payload: any) {
  const res = await fetch(`${API}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

export async function uploadPdfs(files: File[]) {
  const fd = new FormData();
  files.forEach(f => fd.append("files", f));
  const res = await fetch(`${API}/upload-pdfs/`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API}/health/`);
  if (!res.ok) throw new Error("Health failed");
  return res.json();
}
