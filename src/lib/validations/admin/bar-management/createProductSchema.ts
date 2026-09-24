import { imageFileSchema } from "../../shared/imageFileSchema";
import { regex } from "@/shared/utils/constants/regex";
import { z } from "zod";

const createProductSchema = z.object({
  // 1. Nome

  name: z.string().regex(regex.productName).min(1, "Digite o nome do produto.").max(30, "O nome do produto está muito longo."),

  // 2. Descrição

  description: z
    .string()
    .regex(regex.productDescription)
    .min(1, "Digite uma descrição para o produto.")
    .max(100, "A descrição do produto está muito longa."),

  // 3. Categoria

  category: z.enum(["beers", "cocktails", "drinks", "no_alcohol"]),

  // 4. Quantity

  quantity: z.number().positive(),

  // 5. Imagem

  image: imageFileSchema,

  // 6. Preço

  price: z.number().positive(),

  // 7. Estado

  status: z.enum(["active", "inactive"]),
});

export { createProductSchema };
