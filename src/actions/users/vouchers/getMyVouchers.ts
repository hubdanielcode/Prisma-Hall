"use server";

import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "../../authentication/validateSession";

const getMyVouchers = async () => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    const vouchers = await prisma.voucher.findMany({
      where: { userId: validSession.user.id },
      include: {
        product: true,
        order: { include: { voucherPayments: { orderBy: { createdAt: "desc" }, take: 1 } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return vouchers.map((voucher) => ({
      id: voucher.id,
      orderId: voucher.orderId,
      productId: voucher.productId,
      quantity: voucher.quantity,
      orderStatus: voucher.order.status,
      paymentStatus: voucher.order.voucherPayments[0]?.status ?? "pending",
      pickedUpAt: voucher.order.voucherPayments[0]?.pickedUpAt ? voucher.order.voucherPayments[0].pickedUpAt.toISOString() : null,

      product: {
        id: voucher.product.id,
        name: voucher.product.name,
        category: voucher.product.category,
        description: voucher.product.description,
        image: voucher.product.image,

        // 1. O preço gravado no voucher no momento da compra, não o do produto, que pode ter sido reajustado depois

        price: voucher.unitPrice.toNumber(),
      },

      createdAt: voucher.createdAt.toISOString(),
      updatedAt: voucher.updatedAt.toISOString(),
    }));
  } catch {
    return false;
  }
};

export { getMyVouchers };
