import { atLeastOneFieldUpdated } from "@/shared/utils/functions/atLeastOneFieldUpdated";
import { userSchema } from "./userSchemas";
import { z } from "zod";

const editUserSchema = userSchema
  .partial()
  .extend({ userId: z.uuid() })
  .refine(
    (user) => {
      const { userId, ...userWithoutId } = user;

      return atLeastOneFieldUpdated(userWithoutId);
    },

    { message: "Para validar a edição, altere pelo menos um dos campos." },
  );

export { editUserSchema };
