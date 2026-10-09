"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { createEventSchema } from "@/lib/validations/admin/events-management/createEventSchema";
import { notifyPromotionSubscribers } from "@/lib/notifications/notifyUsers";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import z from "zod";

const createEvent = async (event: z.infer<typeof createEventSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedEvent = createEventSchema.safeParse(event);

  if (!parsedEvent.success) {
    return false;
  }

  const imageFile = parsedEvent.data.image;

  try {
    const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

    const newEvent = await prisma.event.create({
      data: {
        title: parsedEvent.data.title,
        description: parsedEvent.data.description,
        tag: parsedEvent.data.tag,
        attractionName: parsedEvent.data.attractionName,
        image: blob.url,
        price: parsedEvent.data.price,
        status: parsedEvent.data.status,
        startsAt: parsedEvent.data.startsAt,
      },
    });

    /* - Avisa quem ativou as notificações de promoções que existe um novo evento na agenda - */

    if (newEvent.status === "soon") {
      await notifyPromotionSubscribers({
        type: "new_event",
        title: "Novo evento na agenda",
        message: `${newEvent.title} com ${newEvent.attractionName} já está na agenda.`,
      });
    }

    return {
      id: newEvent.id,
      title: newEvent.title,
      description: newEvent.description,
      tag: newEvent.tag,
      attractionName: newEvent.attractionName,
      image: newEvent.image,
      status: newEvent.status,
      price: newEvent.price.toNumber(),
      startsAt: newEvent.startsAt.toISOString(),
      attendees: newEvent.attendees,
      rating: newEvent.rating.toNumber(),

      createdAt: newEvent.createdAt.toISOString(),
      updatedAt: newEvent.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { createEvent };
