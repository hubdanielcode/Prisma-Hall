"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { prisma } from "@/lib/prisma";

const deleteEvent = async (eventId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  try {
    await prisma.event.delete({ where: { id: eventId } });
  } catch {
    return false;
  }
  return true;
};

export { deleteEvent };
