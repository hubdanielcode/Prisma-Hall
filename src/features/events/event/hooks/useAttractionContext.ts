import { AttractionContext } from "../context/AttractionContext";
import { useContext } from "react";

const useAttractionContext = () => {
  const context = useContext(AttractionContext);

  if (!context) {
    throw new Error("useAttractionContext must be used within an AttractionProvider");
  }

  return context;
};

export { useAttractionContext };
