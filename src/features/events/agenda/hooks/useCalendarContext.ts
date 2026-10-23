import { CalendarContext } from "../../agenda/context/CalendarContext";
import { useContext } from "react";

const useCalendarContext = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("useCalendarContext must be used within a CalendarProvider");
  }

  return context;
};

export { useCalendarContext };
