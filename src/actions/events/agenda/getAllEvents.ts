"use server";

import { getEventStatus, prisma } from "@/lib/server";

const getAllEvents = async () => {
  try {
    const events = await prisma.event.findMany({ include: { attraction: { select: { id: true, name: true } } } });

    return events.map((event) => ({
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
    throw new Error("Erro ao buscar eventos.");
  }
};

export { getAllEvents };
