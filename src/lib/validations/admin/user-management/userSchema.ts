import { badgeLevelSchema } from "./badgeLevelSchema";
import { z } from "zod";

const userSchema = z.object({
  // 1. Role

  roles: z.enum(["user", "admin"]),

  // 2. Badge de verificado

  verifiedUser: z.boolean(),

  // 3. Badge de assiduidade

  frequentUser: badgeLevelSchema,

  // 4. Badge de tempo

  oldUser: badgeLevelSchema,

  // 5. Marcado para revalidação de conta

  forceRevalidation: z.boolean(),
});

export { userSchema };
