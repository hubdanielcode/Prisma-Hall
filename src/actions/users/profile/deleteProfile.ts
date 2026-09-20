"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const deleteProfile = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    await prisma.$transaction([
      prisma.ticket.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.ticketPayment.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.ticketOrder.deleteMany({ where: { userId: validSession.user.id } }),

      prisma.voucher.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.voucherPayment.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.voucherOrder.deleteMany({ where: { userId: validSession.user.id } }),

      prisma.gallery.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.galleryLikes.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.review.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.cart.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.session.deleteMany({ where: { userId: validSession.user.id } }),

      prisma.profile.delete({ where: { userId: validSession.user.id } }),
      prisma.user.delete({ where: { id: validSession.user.id } }),
    ]);

    return true;
  } catch {
    return false;
  }
};

export { deleteProfile };
