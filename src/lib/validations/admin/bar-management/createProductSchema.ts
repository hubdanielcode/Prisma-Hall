import { z } from "zod";
import { regex } from "@/shared";
import { imageFileSchema } from "../../shared/imageFileSchema";

const createProductSchema = z.object({
  // 1. Nome

  name: z
    .string()
    .regex(regex.productName)
    .min(1, "Digite o nome do produto.")
    .max(30, "O nome do produto está muito longo."),

  // 2. Categoria

  category: z.enum(["beers", "cocktails", "drinks", "no_alcohol"]),

  // 3. Descrição

  description: z
    .string()
    .regex(regex.productDescription)
    .min(1, "Digite uma descrição para o produto.")
    .max(100, "A descrição do produto está muito longa."),

  // 4. Imagem

  image: imageFileSchema,

  // 5. Preço

  price: z.number().positive(),

  // 6. Estado

  status: z.enum(["active", "inactive"]),
});

export { createProductSchema };
