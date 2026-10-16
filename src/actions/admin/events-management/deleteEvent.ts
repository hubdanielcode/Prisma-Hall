"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { getEventStatus } from "@/lib/server/events/getEventStatus";
import { getUserIdsThatFavoritedEvent, notifyUsersByEmail } from "@/lib/server/notifications/notifyUsers";
import { prisma } from "@/lib/server/services/prisma";

const deleteEvent = async (eventId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  try {
    const eventToDelete = await prisma.event.findUnique({ where: { id: eventId } });

    if (!eventToDelete) {
      return false;
    }

    const usersToNotify = getEventStatus(eventToDelete) === "soon" ? await getUserIdsThatFavoritedEvent(eventId) : [];
    await prisma.event.delete({ where: { id: eventId } });

    await notifyUsersByEmail(usersToNotify, {
      type: "event_update",
      title: "Evento cancelado",
      message: `${eventToDelete.title} foi cancelado.`,
    });
  } catch {
    return false;
  }
  return true;
};

export { deleteEvent };
