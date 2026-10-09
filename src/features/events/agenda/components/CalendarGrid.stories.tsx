import { CalendarGrid } from "./CalendarGrid";
import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Public/Schedule",
  component: CalendarGrid,
  parameters: {
    layout: "fullscreen",
  },
};

const Grid = () => {
  return (
    <QueryProvider>
      <CalendarProvider>
        <CalendarGrid />
      </CalendarProvider>
    </QueryProvider>
  );
};

export { Grid as "Calendar Grid" };
