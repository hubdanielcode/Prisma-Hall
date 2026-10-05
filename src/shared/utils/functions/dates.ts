import { LabelProps } from "@/features/admin/analytics-management/types/labels";
import { regex } from "@/shared/utils/constants/regex";

// 1 Converte data DD/MM/YYYY (string) para um objeto Date

const parsedDate = (date: string) => {
  const [day, month, year] = date.split("/");

  return new Date(`${year}-${month}-${day}`);
};

// 2. Formata uma data ISO em partes separadas (dia, mês, ano, hora)

const formattedDate = (startsAt: string) => {
  const date = new Date(startsAt);

  return {
    dayName: date.toLocaleDateString("pt-BR", { weekday: "long" }),
    dayNumber: date.getDate(),
    month: date.toLocaleDateString("pt-BR", { month: "long" }),
    year: date.getFullYear(),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    timeWithSeconds: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
};

// 3. Formata um objeto Date em texto DD/MM/YYYY

const formattedDateToString = (date: Date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// 4. Monta uma data ISO a partir de ano, mês, dia e horário HH:MM

const formattedDateToISOString = (year: number, monthIndex: number, day: number, time: string) => {
  const [hours, minutes] = regex.eventTime.test(time) ? time.split(":").map(Number) : [0, 0];

  return new Date(year, monthIndex, day, hours, minutes).toISOString();
};

// 5. Converte o período do filtro em datas de início e fim do intervalo (como milissegundos)

const formattedStringToDate = (label: LabelProps) => {
  const threeHours = 60 * 60 * 3 * 1000;
  const twentyFourHours = 60 * 60 * 24 * 1000;
  const sevenDays = 60 * 60 * 24 * 7 * 1000;

  const localTime = new Date(Date.now() - threeHours);

  const year = localTime.getUTCFullYear();
  const monthIndex = localTime.getUTCMonth();
  const weekDayIndex = localTime.getUTCDay();

  const dayStart = localTime.setUTCHours(0, 0, 0, 0) + threeHours;
  const weekStart = dayStart - weekDayIndex * twentyFourHours;
  const monthStart = (year: number, monthIndex: number) => Date.UTC(year, monthIndex, 1) + threeHours;
  const blockOfMonths = (blockSize: number): [intervalStart: number, invervalEnd: number] => {
    const firstMonthOfTheBlock = Math.floor(monthIndex / blockSize) * blockSize;

    return [monthStart(year, firstMonthOfTheBlock), monthStart(year, firstMonthOfTheBlock + blockSize)];
  };

  const intervals: Record<LabelProps, [intervalStart: number, invervalEnd: number]> = {
    today: [dayStart, dayStart + twentyFourHours],
    "this week": [weekStart, weekStart + sevenDays],
    "this month": blockOfMonths(1),
    "two-month period": blockOfMonths(2),
    "three-month period": blockOfMonths(3),
    "four-month period": blockOfMonths(4),
    "six-month period": blockOfMonths(6),
    "this year": [monthStart(year, 0), monthStart(year + 1, 0)],
    "all periods": [0, dayStart + twentyFourHours],
  };

  const [intervalStart, intervalEnd] = intervals[label];

  return { intervalStart, intervalEnd };
};

export { parsedDate, formattedDate, formattedDateToString, formattedDateToISOString, formattedStringToDate };
