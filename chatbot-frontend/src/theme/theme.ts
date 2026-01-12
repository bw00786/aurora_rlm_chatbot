import { createTheme } from "@mui/material/styles";


export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb" },
    background: { default: "#f8fafc" }
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6" },
    background: { default: "#0f172a" }
  }
});