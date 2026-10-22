import { MobileContext } from "../context/MobileContext";
import { useContext } from "react";

const useMobileContext = () => {
  const context = useContext(MobileContext);

  if (!context) {
    throw new Error("useMobileContext must be used within a MobileProvider");
  }
  return context;
};

export { useMobileContext };
