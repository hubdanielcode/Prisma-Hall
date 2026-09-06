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

export type LabelProps = (typeof periodLabels)[number];

export { periodLabels };
