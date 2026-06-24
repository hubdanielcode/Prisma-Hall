import { BarContext } from "@/features/bar/context/BarContext";
import { useContext } from "react";

const useBarContext = () => {
  const context = useContext(BarContext);

  if (!context) {
    throw new Error("useBarContext must be used within a BarProvider");
  }
  return context;
};

export { useBarContext };
