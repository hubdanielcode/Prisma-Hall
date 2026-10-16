"use server";

import { getEventStatus } from "@/lib/server/events/getEventStatus";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/session/validateSession";

const getFavoriteEvents = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    const favorites = await prisma.favoriteEvent.findMany({
      where: { userId: validSession.user.id },
      include: { event: true },
      orderBy: { event: { startsAt: "asc" } },
    });

    return favorites.map(({ event }) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      tag: event.tag,
      attractionName: event.attractionName,
      image: event.image,
      status: getEventStatus(event),
      price: event.price.toNumber(),
      startsAt: event.startsAt.toISOString(),
      attendees: event.attendees,
      rating: event.rating.toNumber(),

      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error("Erro ao buscar eventos favoritos.");
  }
};

export { getFavoriteEvents };
