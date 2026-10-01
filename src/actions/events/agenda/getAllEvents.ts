"use server";

import { prisma } from "@/lib/prisma";

const getAllEvents = async () => {
  try {
    const events = await prisma.event.findMany();

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      tag: event.tag,
      attractionName: event.attractionName,
      image: event.image,
      status: event.status,
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
