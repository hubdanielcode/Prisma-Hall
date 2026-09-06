import { z } from "zod";
import { regex } from "@/shared";

const createAttractionSchema = z.object({
  // 1. Nome

  name: z
    .string()
    .regex(regex.attractionName)
    .min(1, "Digite um nome para a atração do evento.")
    .max(50, "O nome da atração do evento está muito longa."),

  // 2. Descrição

  description: z
    .string()
    .regex(regex.attractionDescription)
    .min(1, "Digite uma descrição para a atração do evento.")
    .max(100, "A descrição da atração do evento está muito longa.")
    .optional(),
});

export { createAttractionSchema };
