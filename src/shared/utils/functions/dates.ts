import { regex } from "@/shared/utils/constants/regex";

/* - Converte data DD/MM/YYYY (string) para um objeto Date - */

const parsedDate = (date: string) => {
  const [day, month, year] = date.split("/");

  return new Date(`${year}-${month}-${day}`);
};

/* - Formata uma data ISO em partes separadas (dia, mês, ano, hora) - */

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

/* - Formata um objeto Date em texto DD/MM/YYYY - */

const formattedDateToString = (date: Date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/* - Monta uma data ISO a partir de ano, mês, dia e horário HH:MM. - */

const formattedDateToISOString = (year: number, monthIndex: number, day: number, time: string) => {
  const [hours, minutes] = regex.eventTime.test(time) ? time.split(":").map(Number) : [0, 0];

  return new Date(year, monthIndex, day, hours, minutes).toISOString();
};

export { parsedDate, formattedDate, formattedDateToString, formattedDateToISOString };
