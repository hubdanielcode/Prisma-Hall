import { ThemeContext } from "../context/ThemeContext";
import { useContext } from "react";

const useThemeContext = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useContext must be used within a ThemeProvider");
  }
  return context;
};

export { useThemeContext };
