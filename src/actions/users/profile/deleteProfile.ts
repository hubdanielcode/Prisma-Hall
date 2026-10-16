"use server";

import { checkRateLimit, resetRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { compare } from "@/lib/server/services/bcrypt";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/session/validateSession";

const deleteProfile = async (password: string) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  if (typeof password !== "string" || !password) {
    return false;
  }

  /* - Limita as tentativas de senha, para a exclusão não servir de brecha para adivinhar a senha - */

  const rateLimit = await checkRateLimit({ action: "deleteProfile", identifier: validSession.user.id, limit: 5, windowSeconds: 15 * 60 });

  if (!rateLimit.allowed) {
    return "too_many_attempts";
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: validSession.user.id },
      select: { password: true, profilePicture: true },
    });

    if (!userToDelete) {
      return false;
    }

    const isValidPassword = await compare(password, userToDelete.password);

    if (!isValidPassword) {
      return "invalid_password";
    }

    await resetRateLimit("deleteProfile", validSession.user.id);

    /* - Não exclui enquanto houver ingresso(s) de evento(s) futuro(s) e/ou voucher(s) pago(s) que ainda não foram retirado(s), para ninguém perder dinheiro sem reembolso - */

    const activeTicket = await prisma.ticket.findFirst({
      where: {
        userId: validSession.user.id,
        status: "active",
        event: { startsAt: { gt: new Date() } },
        order: { ticketPayments: { some: { status: "confirmed" } } },
      },
      select: { id: true },
    });

    const activeVoucher = await prisma.voucher.findFirst({
      where: {
        userId: validSession.user.id,
        status: "active",
        order: { voucherPayments: { some: { status: "confirmed", pickedUpAt: null } } },
      },
      select: { id: true },
    });

    if (activeTicket || activeVoucher) {
      return "active_orders";
    }

    const userGalleries = await prisma.gallery.findMany({
      where: { userId: validSession.user.id },
      select: { id: true, image: true },
    });

    const userGalleryIds = userGalleries.map((gallery) => gallery.id);

    await prisma.$transaction([
      prisma.ticket.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.ticketPayment.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.ticketOrder.deleteMany({ where: { userId: validSession.user.id } }),

      prisma.voucher.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.voucherPayment.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.voucherOrder.deleteMany({ where: { userId: validSession.user.id } }),

      prisma.galleryLikes.deleteMany({ where: { imageId: { in: userGalleryIds } } }),
      prisma.gallery.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.galleryLikes.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.favoriteEvent.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.review.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.cart.deleteMany({ where: { userId: validSession.user.id } }),

      prisma.notification.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.notificationPreference.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.newsletter.deleteMany({ where: { userId: validSession.user.id } }),

      prisma.session.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.profile.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.user.delete({ where: { id: validSession.user.id } }),
    ]);

    /* - Remove a foto de perfil e as imagens da galeria do Blob. A conta continua excluída mesmo sem a remoção - */

    const blobUrls = [...userGalleries.map((gallery) => gallery.image), userToDelete.profilePicture].filter((url): url is string => Boolean(url));

    if (blobUrls.length > 0) {
      try {
        await del(blobUrls);
      } catch {
        // As imagens ficam no Blob, mas a conta já foi excluída
      }
    }

    return true;
  } catch {
    return false;
  }
};

export { deleteProfile };
