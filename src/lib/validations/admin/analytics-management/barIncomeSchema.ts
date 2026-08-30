import { z } from "zod";
import { periodSchema } from "../../shared/periodSchema";

const barIncomeSchema = z.object({
  // 1. Período

  label: periodSchema,

  // 2. Categoria

  category: z.enum(["beers", "cocktails", "drinks", "no_alcohol"]).optional(),

  // 3. Nome do produto

  name: z
    .string()
    .min(1, "Digite o nome do produto.")
    .max(30, "O nome do produto está muito longo.")
    .optional(),
});

export { barIncomeSchema };
