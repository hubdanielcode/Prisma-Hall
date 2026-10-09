import { CalendarHeader } from "./CalendarHeader";
import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Public/Schedule",
  component: CalendarHeader,
  parameters: {
    layout: "fullscreen",
  },
};

const Header = () => {
  return (
    <QueryProvider>
      <CalendarProvider>
        <CalendarHeader />
      </CalendarProvider>
    </QueryProvider>
  );
};

export { Header as "Calendar Header" };
