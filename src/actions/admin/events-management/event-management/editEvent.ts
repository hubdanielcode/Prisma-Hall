"use server";

import { checkIsAdmin } from "../../checkIsAdmin";
import { del, put } from "@vercel/blob";
import { editEventSchema } from "@/lib/validations/admin/events-management/event-management/editEventSchema";
import { getEventStatus, getUserIdsThatFavoritedEvent, notifyFavoriteEventByEmail, notifyPromotionsByEmail, prisma } from "@/lib/server";
import z from "zod";

interface FavoriteEventChangesProps {
  originalEvent: { startsAt: Date; price: number };
  editedEvent: { id: string; title: string; startsAt: Date; price: number; isCancelled: boolean };
}

const notifyFavoriteEventChanges = async ({ originalEvent, editedEvent }: FavoriteEventChangesProps) => {
  const dateChanged = originalEvent.startsAt.getTime() !== editedEvent.startsAt.getTime();
  const priceDropped = editedEvent.price < originalEvent.price;

  if (getEventStatus(editedEvent) !== "soon") {
    return false;
  }

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
    attractionId: parsedEvent.data.attractionId,
    price: parsedEvent.data.price,
    startsAt: parsedEvent.data.startsAt,
  };

  const imageFile = parsedEvent.data.image;

  /* - Guarda a imagem nova enquanto a edição ainda não foi salva no banco - */

  let newImageUrl: string | null = null;

  try {
    const originalEvent = await prisma.event.findUnique({ where: { id: parsedEvent.data.eventId } });

    if (!originalEvent) {
      return false;
    }

    const editedEventStartsAt = parsedEvent.data.startsAt;

    if (
      editedEventStartsAt &&
      new Date(editedEventStartsAt).getTime() !== originalEvent.startsAt.getTime() &&
      new Date(editedEventStartsAt).getTime() <= Date.now()
    ) {
      return false;
    }

    const originalEventValues = { startsAt: originalEvent.startsAt, price: originalEvent.price.toNumber() };

    /* - Só faz upload se houver troca de imagem - */

    if (imageFile) {
      const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

      newImageUrl = blob.url;
    }

    const editedEvent = await prisma.event.update({
      where: { id: parsedEvent.data.eventId },
      data: { ...baseEventData, ...(newImageUrl && { image: newImageUrl }) },
      include: { attraction: { select: { id: true, name: true } } },
    });

    /* - A edição foi salva e a imagem nova é do evento. A antiga só sai do Blob agora; uma falha na remoção não desfaz a edição - */

    if (newImageUrl) {
      newImageUrl = null;

      try {
        await del(originalEvent.image);
      } catch {
        // A edição continua salva mesmo sem a remoção da imagem antiga
      }
    }

    /* - Falha na notificação não pode virar false - */

    try {
      await notifyFavoriteEventChanges({
        originalEvent: originalEventValues,
        editedEvent: { ...editedEvent, price: editedEvent.price.toNumber() },
      });
    } catch (error) {
      console.error("[editEvent] Falha ao notificar:", error);
    }

    return {
      id: editedEvent.id,
      title: editedEvent.title,
      description: editedEvent.description,
      tag: editedEvent.tag,
      attractionId: editedEvent.attraction.id,
      attractionName: editedEvent.attraction.name,
      image: editedEvent.image,
      status: getEventStatus(editedEvent),
      price: editedEvent.price.toNumber(),
      startsAt: editedEvent.startsAt.toISOString(),
      attendees: editedEvent.attendees,
      rating: editedEvent.rating.toNumber(),

      createdAt: editedEvent.createdAt.toISOString(),
      updatedAt: editedEvent.updatedAt.toISOString(),
    };
  } catch {
    /* - Se o banco falhou depois do upload, remove a imagem nova para não ficar órfã no Blob - */

    if (newImageUrl) {
      try {
        await del(newImageUrl);
      } catch {
        // A imagem nova fica no Blob, mas a edição não foi salva
      }
    }

    return false;
  }
};

export { editEvent };
