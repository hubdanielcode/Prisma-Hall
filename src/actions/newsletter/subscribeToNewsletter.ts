"use server";

import { newsletterSchema } from "@/lib/validations/newsletter/newsletterSchema";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";
import z from "zod";

const subscribeToNewsletter = async (subscription: z.infer<typeof newsletterSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return "unauthenticated";
  }

  const parsedSubscription = newsletterSchema.safeParse(subscription);

  if (!parsedSubscription.success) {
    return false;
  }

  if (parsedSubscription.data.email !== validSession.user.email) {
    return "email_mismatch";
  }

  try {
    await prisma.newsletter.upsert({
      where: { userId_email: { userId: validSession.user.id, email: validSession.user.email } },
      update: { isSubscribed: true },
      create: {
        userId: validSession.user.id,
        email: validSession.user.email,
        isSubscribed: true,
      },
    });

    return true;
  } catch {
    return false;
  }
};

export { subscribeToNewsletter };
