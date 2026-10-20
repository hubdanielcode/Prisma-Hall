"use server";

import { favoriteEventIdSchema } from "@/lib/validations/events/favoriteEventSchema";
import { getEventStatus, prisma } from "@/lib/server";
import { validateSession } from "../../session/validateSession";

const favoriteEvent = async (eventId: string) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedEventId = favoriteEventIdSchema.safeParse(eventId);

  if (!parsedEventId.success) {
    return false;
  }

  try {
    const event = await prisma.event.findUnique({ where: { id: parsedEventId.data } });

    if (!event) {
      return false;
    }

    const existingFavorite = await prisma.favoriteEvent.findUnique({
      where: { userId_eventId: { userId: validSession.user.id, eventId: event.id } },
    });

    /* - Se o usuário já favoritou, o clique remove o favorito (mesmo que o evento já tenha acontecido) - */

    if (existingFavorite) {
      await prisma.favoriteEvent.delete({
        where: { userId_eventId: { userId: validSession.user.id, eventId: event.id } },
      });

      return { eventId: event.id, favorited: false };
    }

    /* - Só dá para favoritar eventos que ainda vão acontecer - */

    if (getEventStatus(event) !== "soon") {
      return false;
    }

    await prisma.favoriteEvent.create({ data: { userId: validSession.user.id, eventId: event.id } });

    return { eventId: event.id, favorited: true };
  } catch {
    return false;
  }
};

export { favoriteEvent };
