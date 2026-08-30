import { z } from "zod";

const periodSchema = z.enum([
  "today",
  "this week",
  "this month",
  "two-month period",
  "three-month period",
  "four-month period",
  "six-month period",
  "this year",
]);

export { periodSchema };
