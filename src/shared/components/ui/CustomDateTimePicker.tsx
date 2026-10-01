"use client";

import { monthNames, dayNames } from "@/features/events";
import { useCalendarContext } from "@/features/events/event/hooks/useCalendarContext";
import { formattedDateToISOString, masks } from "@/shared/utils";
import { regex } from "@/shared/utils/constants/regex";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { GoClock } from "react-icons/go";

interface CustomDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

interface PickedDay {
  year: number;
  monthIndex: number;
  day: number;
}

const CustomDateTimePicker = ({ value, onChange }: CustomDateTimePickerProps) => {
  /* - Puxando do context - */

  const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, setSelectedDay } = useCalendarContext();

  /* - Estados de data e horário - */

  const [pickedDay, setPickedDay] = useState<PickedDay | null>(() => {
    const initialDate = new Date(value);

    if (!value || Number.isNaN(initialDate.getTime())) {
      return null;
    }

    return { year: initialDate.getFullYear(), monthIndex: initialDate.getMonth(), day: initialDate.getDate() };
  });

  const [time, setTime] = useState<string>(() => {
    const initialDate = new Date(value);

    if (!value || Number.isNaN(initialDate.getTime())) {
      return "";
    }

    const hours = initialDate.getHours().toString().padStart(2, "0");
    const minutes = initialDate.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  });

  /* - Definições - */

  const currentMonthIndex = monthNames.indexOf(selectedMonth);
  const firstDay = new Date(selectedYear, currentMonthIndex, 1).getDay();
  const totalDays = new Date(selectedYear, currentMonthIndex + 1, 0).getDate();
  const calendarCells = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }).map((_, index) => index + 1)];

  /* - Funções - */

  // 1. Passa para o mês seguinte

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setSelectedMonth(monthNames[0]);
      setSelectedYear(selectedYear + 1);
      setSelectedDay(0);
    } else {
      setSelectedMonth(monthNames[currentMonthIndex + 1]);
      setSelectedDay(0);
    }
  };

  // 2. Passa para o mês anterior

  const handlePreviousMonth = () => {
    if (currentMonthIndex === 0) {
      setSelectedMonth(monthNames[11]);
      setSelectedYear(selectedYear - 1);
      setSelectedDay(0);
    } else {
      setSelectedMonth(monthNames[currentMonthIndex - 1]);
      setSelectedDay(0);
    }
  };

  // 3. Confere se o dia da célula é o dia escolhido (mesmo ano, mesmo mês e mesmo dia)

  const isSelectedDay = (day: number | null) => {
    if (day === null || !pickedDay) {
      return false;
    }

    const isSameYear = pickedDay.year === selectedYear;
    const isSameMonth = pickedDay.monthIndex === currentMonthIndex;
    const isSameDay = pickedDay.day === day;

    if (isSameYear && isSameMonth && isSameDay) {
      return true;
    }

    return false;
  };

  // 4. Guarda o dia escolhido (não entrega nada ao modal ainda)

  const handleSelectDay = (day: number) => {
    setPickedDay({ year: selectedYear, monthIndex: currentMonthIndex, day });
  };

  // 5. Aplica a máscara no horário (não entrega nada ao modal ainda)

  const handleTimeChange = (rawTime: string) => {
    setTime(masks.eventTime(rawTime));
  };

  // 6. Único ponto de entrega: só monta o ISO se houver dia escolhido e horário completo e válido

  const handleSave = () => {
    if (!pickedDay || !regex.eventTime.test(time)) {
      return;
    }

    onChange(formattedDateToISOString(pickedDay.year, pickedDay.monthIndex, pickedDay.day, time));
  };

  return (
    <div className="flex flex-col justify-center items-center w-full mx-auto bg-[black] border border-[#333] focus-within:border-[#B8860B] rounded-lg  transition-colors">
      {/* - Header - */}

      <div className="flex justify-around items-center w-full pt-8 pb-4 sm:pb-3 bg-[#0A0A0A] rounded-t-lg border-b border-[#333]">
        {/* - Botão de mês anterior - */}

        <button
          className="text-[#B8860B] cursor-pointer bg-[#0A0A0A80]"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-8 w-8 p-1" />
        </button>

        {/* - Título - */}

        <div className="flex flex-col gap-1.5">
          <span className="flex items-start text-white font-bold text-lg pl-6">
            {selectedMonth} {selectedYear}
          </span>

          <span className="items-center text-[#B8860B] text-xs uppercase">Selecione data e hora</span>
        </div>

        {/* - Botão de próximo mês - */}

        <button
          className="text-[#B8860B] cursor-pointer bg-[#0A0A0A80]"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-8 w-8 p-1" />
        </button>
      </div>

      {/* - Grid - */}

      <div className="flex flex-col w-full max-w-xs md:max-w-sm min-h-80 sm:min-h-64 p-2">
        {/* - Nomes dos dias da semana - */}

        <div className="grid grid-cols-7 w-full">
          {dayNames.map((day) => (
            <span
              className="text-center text-white/60 text-xs md:text-sm font-semibold py-2 sm:py-1 tracking-widest"
              key={day}
            >
              {day}
            </span>
          ))}
        </div>

        {/* - Dias - */}

        <div className="grid grid-cols-7 gap-1 md:gap-2 w-full mx-auto">
          {calendarCells.map((day, index) => (
            <button
              className={`relative flex flex-col items-center justify-center text-xs sm:text-sm font-semibold w-full max-w-10 sm:max-w-8 md:max-w-12 aspect-square mx-auto bg-[#222] rounded-lg  ${
                day ? "cursor-pointer hover:bg-[#333]" : "cursor-default"
              } 
              ${isSelectedDay(day) ? "bg-[#B8860B] hover:bg-[#DDAE56] text-black" : "bg-[#0A0A0A] hover:bg-[#333] text-white"}`}
              key={index}
              onClick={() => day && handleSelectDay(day)}
            >
              {day ?? ""}
            </button>
          ))}
        </div>

        {/* - Horário e salvar - */}

        <div className="flex gap-5 items-center justify-center">
          <div className="flex items-center justify-end bg-[#0A0A0A] border border-[#333] focus-within:border-[#B8860B] rounded-lg px-3 transition-colors my-2 w-25 ml-auto">
            <span className="text-[#B8860B] text-sm font-bold mr-1">
              <GoClock className="h-4 w-4" />
            </span>

            <input
              type="text"
              placeholder="00:00"
              className="bg-transparent py-2.5 text-sm text-white placeholder:text-white/30 outline-none min-w-0"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
            />
          </div>

          <button
            className="px-3 py-2.5 w-25 text-sm text-white font-semibold bg-[#2A2A2A] hover:bg-[#333] rounded-lg cursor-pointer"
            type="button"
            onClick={() => {
              handleSave();
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export { CustomDateTimePicker };
