"use server";

import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "../authentication/validateSession";

const getMySubscription = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }
  try {
    const subscription = await prisma.newsletter.findUnique({
      where: { userId_email: { userId: validSession.user.id, email: validSession.user.email } },
    });

    if (!subscription) {
      return false;
    }

    return subscription.isSubscribed;
  } catch {
    return false;
  }
};

export { getMySubscription };
