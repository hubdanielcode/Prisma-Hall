import { z } from "zod";
import { periodSchema } from "../../shared/periodSchema";

const ticketIncomeSchema = z.object({
  // 1. Período

  label: periodSchema,

  // 2. Tag do evento

  tag: z
    .enum(["trap_and_hiphop", "forro", "samba_and_pagode", "metal", "eletronica", "funk", "rock"])
    .optional(),

  // 3. Nome do evento

  name: z
    .string()
    .min(1, "Digite o nome do evento.")
    .max(30, "O nome do evento está muito longo.")
    .optional(),
});

export { ticketIncomeSchema };
