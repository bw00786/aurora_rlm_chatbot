import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#4f46e5"
      }
    },
    shape: {
      borderRadius: 12
    }
  });
