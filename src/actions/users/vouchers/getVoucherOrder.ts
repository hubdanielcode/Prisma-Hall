"use server";

import { orderIdSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";
import type { VoucherOrderProps } from "@/features/users/vouchers/types/voucherOrder";

const getVoucherOrder = async (orderId: string): Promise<VoucherOrderProps | false> => {
  const validSession = await validateSession();

  if (!validSession) {
    throw new Error("Acesso negado.");
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
        voucherPayment: { orderBy: { createdAt: "desc" } },
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
          price: voucher.product.price.toNumber(),
        },
      })),

      payments: order.voucherPayment.map((payment) => ({
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
    throw new Error("Erro ao buscar pedido de vouchers.");
  }
};

export { getVoucherOrder };
