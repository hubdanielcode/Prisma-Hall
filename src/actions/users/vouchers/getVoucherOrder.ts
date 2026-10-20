"use server";

import { orderIdSchema } from "@/lib/validations/users/orderIdSchema";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "../../session/validateSession";
import type { VoucherOrderProps } from "@/features/users/vouchers/types/voucherOrder";

const getVoucherOrder = async (orderId: string): Promise<VoucherOrderProps | false> => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedOrderId = orderIdSchema.safeParse(orderId);

  if (!parsedOrderId.success) {
    return false;
  }

  try {
    const order = await prisma.voucherOrder.findUnique({
      where: { id: parsedOrderId.data },
      include: {
        vouchers: { include: { product: true } },
        voucherPayments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order || order.userId !== validSession.user.id) {
      return false;
    }

    return {
      id: order.id,
      status: order.status,

      vouchers: order.vouchers.map((voucher) => ({
        id: voucher.id,
        productId: voucher.productId,
        quantity: voucher.quantity,

        product: {
          id: voucher.product.id,
          name: voucher.product.name,
          category: voucher.product.category,
          description: voucher.product.description,
          image: voucher.product.image,

          // 1. O preço gravado no voucher no momento da compra, não o do produto, que pode ter sido reajustado depois

          price: voucher.unitPrice.toNumber(),
        },
      })),

      payments: order.voucherPayments.map((payment) => ({
        id: payment.id,
        method: payment.method,
        status: payment.status,
        totalValue: payment.totalValue.toNumber(),
        pickedUpAt: payment.pickedUpAt ? payment.pickedUpAt.toISOString() : null,

        createdAt: payment.createdAt.toISOString(),
      })),

      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { getVoucherOrder };
