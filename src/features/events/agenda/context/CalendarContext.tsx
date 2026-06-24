import { createContext, useState, type ReactNode } from "react";

interface CalendarContextType {
  /* - Estados de data - */

  selectedYear: number;
  setSelectedYear: (selectedYear: number) => void;
  selectedMonth: string;
  setSelectedMonth: (selectedMonth: string) => void;
  selectedDay: number;
  setSelectedDay: (selectedDay: number) => void;

  /* - Estados de vizualização - */

  viewState: "Calendar" | "List";
  setViewState: (viewState: "Calendar" | "List") => void;

  /* - Estados de categoria - */
}

const CalendarContext = createContext<CalendarContextType | null>(null);

const CalendarProvider = ({ children }: { children: ReactNode }) => {
  /* - Estados de data - */

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<string>("Maio");
  const [selectedDay, setSelectedDay] = useState<number>(1);

  /* - Estados de vizualização - */

  const [viewState, setViewState] = useState<"Calendar" | "List">("Calendar");

  return (
    <CalendarContext.Provider
      value={{
        /* - Estados de data - */

        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        selectedDay,
        setSelectedDay,

        /* - Estados de vizualização - */

        viewState,
        setViewState,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export { CalendarContext, CalendarProvider };
