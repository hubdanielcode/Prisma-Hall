import { imageFileSchema } from "@/lib/validations/shared/imageFileSchema";
import { regex } from "@/shared/utils/constants/regex";
import { z } from "zod";

const createGalleryPictureSchema = z.object({
  // 1. Evento em que a foto foi tirada

  eventId: z.uuid("Selecione um evento."),

  // 2. Título

  title: z.string().regex(regex.eventTitle).min(1, "Digite o título da foto.").max(30, "O título da foto está muito longo."),

  // 3. Imagem

  image: imageFileSchema,

  // 4. Data (aceita a data ISO enviada pelo picker ou um objeto Date, mantendo o horário escolhido)

  happenedAt: z.union([z.iso.datetime(), z.date()], "Digite uma data válida.").transform((happenedAt: string | Date, zodValidationContext) => {
    const parsedHappenedAt = new Date(happenedAt);

    if (isNaN(parsedHappenedAt.getTime())) {
      zodValidationContext.addIssue({ code: "custom", message: "Digite uma data válida." });
      return z.NEVER;
    } else {
      return parsedHappenedAt;
    }
  }),
});

export { createGalleryPictureSchema };
