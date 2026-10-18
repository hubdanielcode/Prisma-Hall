"use server";

import { getEventStatus } from "@/lib/server/events/getEventStatus";
import { prisma } from "@/lib/server/services/prisma";

const getSingleEvent = async (eventId: string) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      return false;
    }

    return {
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
    };
  } catch {
    throw new Error("Erro ao buscar evento.");
  }
};

export { getSingleEvent };
