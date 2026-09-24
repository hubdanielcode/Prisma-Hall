"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { editEventSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import z from "zod";

const editEvent = async (event: z.infer<typeof editEventSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedEvent = editEventSchema.safeParse(event);

  if (!parsedEvent.success) {
    return false;
  }

  const baseEventData = {
    title: parsedEvent.data.title,
    description: parsedEvent.data.description,
    tag: parsedEvent.data.tag,
    attractionId: parsedEvent.data.attractionId,
    status: parsedEvent.data.status,
    price: parsedEvent.data.price,
    startsAt: parsedEvent.data.startsAt,
  };

  const imageFile = parsedEvent.data.image;

  try {
    if (imageFile) {
      /* - Se houver troca de imagem - */

      const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

      const editedEvent = await prisma.event.update({
        where: { id: parsedEvent.data.eventId },
        data: { ...baseEventData, image: blob.url },
      });

      return {
        id: editedEvent.id,
        title: editedEvent.title,

        description: editedEvent.description,
        tag: editedEvent.tag,
        attractionId: editedEvent.attractionId,
        image: editedEvent.image,
        status: editedEvent.status,
        price: editedEvent.price.toNumber(),
        startsAt: editedEvent.startsAt,
        attendees: editedEvent.attendees,
        rating: editedEvent.rating.toNumber(),

        createdAt: editedEvent.createdAt.toISOString(),
        updatedAt: editedEvent.updatedAt.toISOString(),
      };
    }
    /* - Se não houver troca de imagem - */

    const editedEvent = await prisma.event.update({
      where: { id: parsedEvent.data.eventId },
      data: { ...baseEventData },
    });

    return {
      id: editedEvent.id,
      title: editedEvent.title,

      description: editedEvent.description,
      tag: editedEvent.tag,
      attractionId: editedEvent.attractionId,
      image: editedEvent.image,
      status: editedEvent.status,
      price: editedEvent.price.toNumber(),
      startsAt: editedEvent.startsAt,
      attendees: editedEvent.attendees,
      rating: editedEvent.rating.toNumber(),

      createdAt: editedEvent.createdAt.toISOString(),
      updatedAt: editedEvent.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { editEvent };
