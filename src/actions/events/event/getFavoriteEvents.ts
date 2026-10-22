"use server";

import { getEventStatus, prisma } from "@/lib/server";
import { validateSession } from "../../authentication/validateSession";

const getFavoriteEvents = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    const favorites = await prisma.favoriteEvent.findMany({
      where: { userId: validSession.user.id },
      include: { event: { include: { attraction: { select: { id: true, name: true } } } } },
      orderBy: { event: { startsAt: "asc" } },
    });

    return favorites.map(({ event }) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      tag: event.tag,
      attractionId: event.attraction.id,
      attractionName: event.attraction.name,
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
