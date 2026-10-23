"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { createEventSchema } from "@/lib/validations/admin/events-management/createEventSchema";
import { del, put } from "@vercel/blob";
import { getEventStatus, notifyPromotionsByEmail, prisma } from "@/lib/server";
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

  /* - O evento precisa começar no futuro. Fica antes do upload da imagem para não deixar imagem órfã no Blob - */

  if (new Date(parsedEvent.data.startsAt).getTime() <= Date.now()) {
    return false;
  }

  const imageFile = parsedEvent.data.image;

  /* - Guarda a imagem enviada enquanto o evento ainda não existe no banco - */

  let newImageUrl: string | null = null;

  try {
    const blob = await put(`${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });

    newImageUrl = blob.url;

    const newEvent = await prisma.event.create({
      data: {
        title: parsedEvent.data.title,
        description: parsedEvent.data.description,
        tag: parsedEvent.data.tag,
        attractionId: parsedEvent.data.attractionId,
        image: blob.url,
        price: parsedEvent.data.price,
        startsAt: parsedEvent.data.startsAt,
      },
      include: { attraction: { select: { id: true, name: true } } },
    });

    /* - A partir daqui o evento já existe e é dono da imagem: o catch não pode mais apagá-la - */

    newImageUrl = null;

    /* - Uma falha na notificação não pode fazer a ação devolver false (retry = evento duplicado) - */

    try {
      if (getEventStatus(newEvent) === "soon") {
        await notifyPromotionsByEmail({
          type: "new_event",
          title: "Novo evento na agenda",
          message: `${newEvent.title} com ${newEvent.attraction.name} já está na agenda.`,
        });
      }
    } catch (error) {
      console.error("[createEvent] Falha ao notificar:", error);
    }

    return {
      id: newEvent.id,
      title: newEvent.title,
      description: newEvent.description,
      tag: newEvent.tag,
      attractionId: newEvent.attraction.id,
      attractionName: newEvent.attraction.name,
      image: newEvent.image,
      price: newEvent.price.toNumber(),
      startsAt: newEvent.startsAt.toISOString(),
      attendees: newEvent.attendees,
      rating: newEvent.rating.toNumber(),

      createdAt: newEvent.createdAt.toISOString(),
      updatedAt: newEvent.updatedAt.toISOString(),
    };
  } catch {
    /* - Se o banco falhou depois do upload, remove a imagem nova para não ficar órfã no Blob - */

    if (newImageUrl) {
      try {
        await del(newImageUrl);
      } catch {
        // A imagem nova fica no Blob, mas nada foi salvo no banco
      }
    }

    return false;
  }
};

export { createEvent };
