"use server";

import { prisma } from "@/lib/prisma";

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
      attractionId: event.attractionId,
      image: event.image,
      status: event.status,
      price: event.price.toNumber(),
      startsAt: event.startsAt,
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
