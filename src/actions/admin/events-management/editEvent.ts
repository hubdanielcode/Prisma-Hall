"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { editEventSchema } from "@/lib/validations";
import { getEventStatus } from "@/lib/server/events/getEventStatus";
import { getUserIdsThatFavoritedEvent, notifyFavoriteEventByEmail, notifyPromotionsByEmail } from "@/lib/server/notifications/notifyUsers";
import { prisma } from "@/lib/server/services/prisma";
import { put } from "@vercel/blob";
import z from "zod";

interface FavoriteEventChangesProps {
  previousEvent: { startsAt: Date; price: number };
  editedEvent: { id: string; title: string; status: string; startsAt: Date; price: number };
}

const notifyFavoriteEventChanges = async ({ previousEvent, editedEvent }: FavoriteEventChangesProps) => {
  if (getEventStatus(editedEvent) !== "soon") {
    return;
  }

  const dateChanged = previousEvent.startsAt.getTime() !== editedEvent.startsAt.getTime();
  const priceDropped = editedEvent.price < previousEvent.price;

  if (!dateChanged && !priceDropped) {
    return;
  }

  const newPrice = `R$ ${editedEvent.price.toFixed(2).replace(".", ",")}`;
  const changes: string[] = [];

  if (dateChanged) {
    changes.push("a data foi alterada");
  }

  if (priceDropped) {
    changes.push(`o preço baixou para ${newPrice}`);
  }

  await notifyFavoriteEventByEmail(editedEvent.id, {
    type: "event_update",
    title: "Evento favorito atualizado",
    message: `${editedEvent.title}: ${changes.join(" e ")}.`,
  });

  if (priceDropped) {
    const favoriteUserIds = await getUserIdsThatFavoritedEvent(editedEvent.id);

    await notifyPromotionsByEmail(
      {
        type: "event_update",
        title: "Preço baixou",
        message: `${editedEvent.title}: o preço baixou para ${newPrice}.`,
      },
      favoriteUserIds,
    );
  }
};

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
    attractionName: parsedEvent.data.attractionName,
    status: parsedEvent.data.status,
    price: parsedEvent.data.price,
    startsAt: parsedEvent.data.startsAt,
  };

  const imageFile = parsedEvent.data.image;

  try {
    const previousEvent = await prisma.event.findUnique({ where: { id: parsedEvent.data.eventId } });

    if (!previousEvent) {
      return false;
    }

    const previousEventValues = { startsAt: previousEvent.startsAt, price: previousEvent.price.toNumber() };

    if (imageFile) {
      /* - Se houver troca de imagem - */

      const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

      const editedEvent = await prisma.event.update({
        where: { id: parsedEvent.data.eventId },
        data: { ...baseEventData, image: blob.url },
      });

      await notifyFavoriteEventChanges({
        previousEvent: previousEventValues,
        editedEvent: { ...editedEvent, price: editedEvent.price.toNumber() },
      });

      return {
        id: editedEvent.id,
        title: editedEvent.title,
        description: editedEvent.description,
        tag: editedEvent.tag,
        attractionName: editedEvent.attractionName,
        image: editedEvent.image,
        status: getEventStatus(editedEvent),
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

    await notifyFavoriteEventChanges({
      previousEvent: previousEventValues,
      editedEvent: { ...editedEvent, price: editedEvent.price.toNumber() },
    });

    return {
      id: editedEvent.id,
      title: editedEvent.title,

      description: editedEvent.description,
      tag: editedEvent.tag,
      attractionName: editedEvent.attractionName,
      image: editedEvent.image,
      status: getEventStatus(editedEvent),
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
