import { useContext } from "react";
import { BarManagementContext } from "../context/BarManagementContext";

const useBarManagementContext = () => {
  const context = useContext(BarManagementContext);
  if (!context) {
    throw new Error(
      "useBarManagementContext must be used within a BarManagementProvider",
    );
  }
  return context;
};

export { useBarManagementContext };
