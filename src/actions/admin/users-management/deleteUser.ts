"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { makeAnonymous } from "@/lib/server/users/makeAnonymous";
import { userIdSchema } from "@/lib/validations/users/userIdSchema";
import { validateSession } from "../../authentication/validateSession";
import z from "zod";

const deleteUser = async (userId: z.infer<typeof userIdSchema>) => {
  /* - Validando o admin e o id do usuário - */

  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedUserId = userIdSchema.safeParse(userId);

  if (!parsedUserId.success) {
    return false;
  }

  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    /* - Impedindo que o site fique sem nenhum admin - */

    if (parsedUserId.data === validSession.user.id) {
      return false;
    }

    return await makeAnonymous(parsedUserId.data);
  } catch {
    return false;
  }
};

export { deleteUser };
