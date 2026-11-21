import { categorySchema } from "../../shared/categorySchema";
import { periodSchema } from "../../shared/periodSchema";
import { z } from "zod";

const voucherIncomeSchema = z.object({
  // 1. Período

  label: periodSchema,

  // 2. Categoria

  category: categorySchema,

  // 3. Nome do produto

  name: z.string().min(1, "Digite o nome do produto.").max(30, "O nome do produto está muito longo.").optional(),
});

export { voucherIncomeSchema };
