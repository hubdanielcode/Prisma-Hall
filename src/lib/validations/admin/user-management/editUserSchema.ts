import { atLeastOneFieldUpdated } from "@/shared/utils/functions/atLeastOneFieldUpdated";
import { z } from "zod";

const badgeLevelSchema = z.enum(["none", "bronze", "silver", "gold"]);

const editUserSchema = z
  .object({
    // 1. Usuário editado

    userId: z.uuid(),

    // 2. Role

    roles: z.enum(["user", "admin"]).optional(),

    // 3. Badge de verificado

    verifiedUser: z.boolean().optional(),

    // 3. Badge de assiduidade

    frequentUser: badgeLevelSchema.optional(),

    // 4. Badge de tempo

    oldUser: badgeLevelSchema.optional(),

    // 5. Marcado para revalidação de conta

    forceRevalidation: z.boolean().optional(),
  })
  .refine(
    (user) => {
      const { userId, ...userWithoutId } = user;

      return atLeastOneFieldUpdated(userWithoutId);
    },

    { message: "Para validar a edição, altere pelo menos um dos campos." },
  );

export { editUserSchema };
