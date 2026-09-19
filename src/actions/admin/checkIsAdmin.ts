"use server";

import { validateSession } from "../session/validateSession";

const checkIsAdmin = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  return validSession.user.role === "admin";
};

export { checkIsAdmin };
