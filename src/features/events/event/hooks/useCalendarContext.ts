import { useContext } from "react";
import { CalendarContext } from "../../agenda/context/CalendarContext";

const useCalendarContext = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("useCalendarContext must be used within a CalendarProvider");
  }
  return context;
};

export { useCalendarContext };
