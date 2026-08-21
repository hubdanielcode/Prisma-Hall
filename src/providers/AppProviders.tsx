import { BrowserRouter as Router } from "react-router-dom";
import type React from "react";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <Router>{children}</Router>;
};

export { AppProviders };
