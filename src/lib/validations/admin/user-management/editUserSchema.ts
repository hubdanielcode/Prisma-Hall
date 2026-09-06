import { z } from "zod";
import { atLeastOneFieldUpdated } from "../../../../shared/utils/atLeastOneFieldUpdated";

const editUserSchema = z
  .object({
    // 1. Role

    roles: z.enum(["user", "admin"]).optional(),

    // 2. Verificado (Reviews)

    verifiedUser: z.boolean().optional(),

    // 3. Assíduo (Eventos)

    frequentUser: z.enum(["bronze(3)", "silver(8)", "gold(15)"]).optional(),

    // 4. Fiel (Tempo)

    oldUser: z.enum(["bronze(1)", "silver(2)", "gold(3)"]).optional(),

    // 5. Marcado para revalidação de conta

    forceRevalidation: z.boolean().optional(),
  })
  .refine(
    (user) => {
      return atLeastOneFieldUpdated(user);
    },

    { message: "Para validar a edição, altere pelo menos um dos campos." },
  );

export { editUserSchema };
