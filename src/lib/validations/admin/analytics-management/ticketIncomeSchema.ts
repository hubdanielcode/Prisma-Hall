import { periodSchema } from "../../shared/periodSchema";
import { tagSchema } from "../../shared/tagSchema";
import { z } from "zod";

const ticketIncomeSchema = z.object({
  // 1. Período

  label: periodSchema,

  // 2. Tag do evento

  tag: tagSchema,

  // 3. Nome do evento

  name: z.string().min(1, "Digite o nome do evento.").max(30, "O nome do evento está muito longo.").optional(),
});

export { ticketIncomeSchema };
