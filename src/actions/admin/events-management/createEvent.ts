"use server";

import { createEventSchema } from "@/lib/validations";
import z from "zod";
import { checkIsAdmin } from "../checkIsAdmin";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const createEvent = async (event: z.infer<typeof createEventSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedEvent = createEventSchema.safeParse(event);

  if (!parsedEvent.success) {
    console.log(parsedEvent.error.issues);
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
        attractionId: parsedEvent.data.attractionId,
        image: blob.url,
        price: parsedEvent.data.price,
        status: parsedEvent.data.status,
        startsAt: parsedEvent.data.startsAt,
      },
    });
    return newEvent;
  } catch {
    return false;
  }
};

export { createEvent };
