const periodLabels = [
  "today",
  "this week",
  "this month",
  "two-month period",
  "three-month period",
  "four-month period",
  "six-month period",
  "this year",
  "all periods",
] as const;

const periodOptions: { id: PeriodLabelProps; title: string }[] = [
  { id: "today", title: "Hoje" },
  { id: "this week", title: "Esta Semana" },
  { id: "this month", title: "Este Mês" },
  { id: "two-month period", title: "Bimestre" },
  { id: "three-month period", title: "Trimestre" },
  { id: "four-month period", title: "Quadrimestre" },
  { id: "six-month period", title: "Semestre" },
  { id: "this year", title: "Este Ano" },
  { id: "all periods", title: "Todos os períodos" },
];

export { periodLabels, periodOptions };
export type PeriodLabelProps = (typeof periodLabels)[number];
