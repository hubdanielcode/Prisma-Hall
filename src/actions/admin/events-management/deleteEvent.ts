"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { del } from "@vercel/blob";
import { getEventStatus } from "@/lib/server/events/getEventStatus";
import { getUserIdsThatFavoritedEvent, notifyUsersByEmail } from "@/lib/server/notifications/notifyUsers";
import { prisma } from "@/lib/server/services/prisma";
import type { DeleteEventResult } from "@/features/events/event/types/event";

const deleteEvent = async (eventId: string): Promise<DeleteEventResult> => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return { success: false, reason: "unauthorized" };
  }

  let eventTitle: string;
  let eventImage: string;
  let usersToNotify: string[];

  try {
    const eventToDelete = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { tickets: true, reviews: true, galleries: true } } },
    });

    if (!eventToDelete) {
      return { success: false, reason: "not-found" };
    }

    /* - Ingresso, avaliação e galeria têm FK sem cascade (Restrict): o delete falharia. Evento com venda deve ser cancelado (cancelEvent), que faz o reembolso - */

    const { tickets, reviews, galleries } = eventToDelete._count;

    if (tickets > 0 || reviews > 0 || galleries > 0) {
      return { success: false, reason: "has-dependencies" };
    }

    eventTitle = eventToDelete.title;
    eventImage = eventToDelete.image;

    /* - Precisa buscar os favoritos antes do delete, porque o cascade apaga os favoritos junto - */

    usersToNotify = getEventStatus(eventToDelete) === "soon" ? await getUserIdsThatFavoritedEvent(eventId) : [];

    /* - Item de carrinho não bloqueia (SetNull) mas ficaria órfão, então é removido na mesma transação do delete - */

    await prisma.$transaction([prisma.cart.deleteMany({ where: { eventId } }), prisma.event.delete({ where: { id: eventId } })]);
  } catch {
    return { success: false, reason: "unknown" };
  }

  /* - O evento já foi apagado: a imagem sai do Blob e uma falha aqui não vira erro - */

  try {
    await del(eventImage);
  } catch {
    // O evento continua apagado mesmo sem a remoção da imagem
  }

  /* - Falha na notificação também não vira erro - */

  try {
    await notifyUsersByEmail(usersToNotify, {
      type: "event_update",
      title: "Evento cancelado",
      message: `${eventTitle} foi cancelado.`,
    });
  } catch (error) {
    console.error("[deleteEvent] Falha ao notificar:", error);
  }

  return { success: true };
};

export { deleteEvent };
