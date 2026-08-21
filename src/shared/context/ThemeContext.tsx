"use client";

import { createContext, useEffect, useState } from "react";
import { applyTheme, getTheme, saveTheme, Theme } from "../utils/theme";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | null>(null);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("Dark");

  useEffect(() => {
    const storedTheme = getTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "Dark" ? "Light" : "Dark";

    setTheme(newTheme);
    saveTheme(newTheme);
    applyTheme(newTheme);
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export { ThemeContext, ThemeProvider };
