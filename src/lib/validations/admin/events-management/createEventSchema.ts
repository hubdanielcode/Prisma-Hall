import { z } from "zod";
import { regex } from "@/shared";
import { imageFileSchema } from "../../shared/imageFileSchema";

const createEventSchema = z.object({
  // 1. Título

  title: z
    .string()
    .regex(regex.eventTitle)
    .min(1, "Digite o título do evento.")
    .max(30, "O título do evento está muito longo."),

  // 2. Tag do evento

  tag: z.enum([
    "trap_and_hiphop",
    "forro",
    "samba_and_pagode",
    "metal",
    "eletronica",
    "funk",
    "rock",
  ]),

  // 3. Descrição

  description: z
    .string()
    .regex(regex.eventDescription)
    .min(1, "Digite uma descrição para o evento.")
    .max(100, "A descrição do evento está muito longa."),

  // 4. Artista

  attraction: z.enum([]),

  // 5. Imagem

  image: imageFileSchema,

  // 6. Estado

  status: z.enum(["happened", "soon"]),

  // 7. Preço

  price: z.number().nonnegative(),

  // 8. Horário

  startsAt: z.coerce.date(),
});

export { createEventSchema };
