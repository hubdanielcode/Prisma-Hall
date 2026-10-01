import { useContext } from "react";
import { EventContext } from "../context/EventContext";

const useEventContext = () => {
  const context = useContext(EventContext);

  if (!context) {
    throw new Error("EventContext must be used inside an EventProvider");
  }

  return context;
};

export { useEventContext };
