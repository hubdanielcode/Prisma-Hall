import { imageFileSchema } from "../../shared/imageFileSchema";
import { regex } from "@/shared/utils/constants/regex";
import { tagSchema } from "../../shared/tagSchemas";
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

  attractionName: z
    .string()
    .regex(regex.eventAttractionName)
    .min(1, "Digite um nome para a atração do evento.")
    .max(50, "O nome da atração do evento está muito longo."),

  // 5. Imagem

  image: imageFileSchema,

  // 6. Estado

  status: z.enum(["happened", "soon"]),

  // 7. Preço

  price: z.number().positive(),

  // 8. Horário

  startsAt: z.string(),
});

export { createEventSchema };
