"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateSession } from "./validateSession";

const revokeSession = async () => {
  const cookieStore = await cookies();
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    await prisma.session.update({
      where: { id: validSession.session.id },
      data: {
        revokedAt: new Date(),
      },
    });

    cookieStore.delete("validSession");
  } catch {
    return false;
  }

  return true;
};

export { revokeSession };
