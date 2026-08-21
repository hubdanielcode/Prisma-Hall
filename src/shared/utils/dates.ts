/* - Converte data DD/MM/YYYY (string) para um objeto Date - */

const parsedDate = (date: string) => {
  const [day, month, year] = date.split("/");

  return new Date(`${year}-${month}-${day}`);
};

/* - Formata uma data ISO em partes separadas (dia, mês, ano, hora) - */

const formattedDate = (starts_at: string) => {
  const date = new Date(starts_at);

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

/* - Retorna o tempo relativo desde a data informada - */

export { parsedDate, formattedDate };
