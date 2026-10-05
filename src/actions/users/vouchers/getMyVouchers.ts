"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";

const getMyVouchers = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    throw new Error("Acesso negado.");
  }

  try {
    const vouchers = await prisma.voucher.findMany({
      where: { userId: validSession.user.id },
      include: {
        product: true,
        order: { include: { voucherPayment: { orderBy: { createdAt: "desc" }, take: 1 } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return vouchers.map((voucher) => ({
      id: voucher.id,
      orderId: voucher.orderId,
      productId: voucher.productId,
      quantity: voucher.quantity,
      orderStatus: voucher.order.status,
      paymentStatus: voucher.order.voucherPayment[0]?.status ?? "pending",
      pickedUpAt: voucher.order.voucherPayment[0]?.pickedUpAt ? voucher.order.voucherPayment[0].pickedUpAt.toISOString() : null,

      product: {
        id: voucher.product.id,
        name: voucher.product.name,
        category: voucher.product.category,
        description: voucher.product.description,
        image: voucher.product.image,
        price: voucher.product.price.toNumber(),
      },

      createdAt: voucher.createdAt.toISOString(),
      updatedAt: voucher.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error("Erro ao buscar vouchers.");
  }
};

export { getMyVouchers };
