import { z } from "zod";

const userSchema = z.object({
  // 1. Role

  roles: z.enum(["user", "admin"]),

  // 2. Marcado para revalidação de conta

  forceRevalidation: z.boolean(),
});

export { userSchema };
