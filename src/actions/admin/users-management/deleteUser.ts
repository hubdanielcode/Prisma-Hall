"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { prisma } from "@/lib/prisma";

const deleteUser = async (userId: string) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  try {
    await prisma.$transaction([
      prisma.ticket.deleteMany({ where: { userId: userId } }),
      prisma.ticketPayment.deleteMany({ where: { userId: userId } }),
      prisma.ticketOrder.deleteMany({ where: { userId: userId } }),

      prisma.voucher.deleteMany({ where: { userId: userId } }),
      prisma.voucherPayment.deleteMany({ where: { userId: userId } }),
      prisma.voucherOrder.deleteMany({ where: { userId: userId } }),

      prisma.gallery.deleteMany({ where: { userId: userId } }),
      prisma.galleryLikes.deleteMany({ where: { userId: userId } }),
      prisma.review.deleteMany({ where: { userId: userId } }),
      prisma.cart.deleteMany({ where: { userId: userId } }),
      prisma.session.deleteMany({ where: { userId: userId } }),

      prisma.profile.deleteMany({ where: { userId: userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return true;
  } catch {
    return false;
  }
};

export { deleteUser };
