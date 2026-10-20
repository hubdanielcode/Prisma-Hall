import { imageFileSchema } from "../../shared/imageFileSchema";
import { regex } from "@/shared/utils/constants/regex";
import { tagSchema } from "../../shared/tagSchema";
import { z } from "zod";

const createEventSchema = z.object({
  // 1. Título

  title: z.string().regex(regex.eventTitle).min(1, "Digite o título do evento.").max(50, "O título do evento está muito longo."),

  // 2. Tag do evento

  tag: tagSchema,

  // 3. Descrição

  description: z
    .string()
    .regex(regex.eventDescription)
    .min(1, "Digite uma descrição para o evento.")
    .max(150, "A descrição do evento está muito longa."),

  // 4. Nome da atração (banda/artista)

  attractionId: z.uuid("Selecione uma atração."),

  // 5. Imagem

  image: imageFileSchema,

  // 6. Preço

  price: z.number().positive(),

  // 7. Horário (aceita a data ISO enviada pelo picker ou um objeto Date, mantendo o horário escolhido)

  startsAt: z.union([z.iso.datetime(), z.date()], "Digite uma data válida.").transform((startsAt: string | Date, zodValidationContext) => {
    const parsedStartsAt = new Date(startsAt);

    if (isNaN(parsedStartsAt.getTime())) {
      zodValidationContext.addIssue({ code: "custom", message: "Digite uma data válida." });
      return z.NEVER;
    } else {
      return parsedStartsAt;
    }
  }),
});

export { createEventSchema };
