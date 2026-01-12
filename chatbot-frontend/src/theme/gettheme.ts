import { createTheme, Theme } from "@mui/material/styles";

export function getTheme(mode: "light" | "dark"): Theme {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#1976d2" : "#90caf9"
      },
      background: {
        default: mode === "light" ? "#ffffff" : "#121212"
      }
    }
  });
}