"use server";

import { buyVouchersSchema } from "@/lib/validations/users/orderIdSchema";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/session/validateSession";
import z from "zod";

const buyVouchers = async (voucher: z.infer<typeof buyVouchersSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedVoucher = buyVouchersSchema.safeParse(voucher);

  if (!parsedVoucher.success) {
    return false;
  }

  const quantityByProduct = new Map<string, number>();

  parsedVoucher.data.items.forEach((item) => {
    quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity);
  });

  try {
    const newOrder = await prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: { id: { in: Array.from(quantityByProduct.keys()) }, status: "active" },
      });

      if (products.length !== quantityByProduct.size) {
        throw new Error("Produto indisponível.");
      }

      let totalValue = 0;

      for (const product of products) {
        const quantity = quantityByProduct.get(product.id)!;

        const stockUpdate = await transaction.product.updateMany({
          where: { id: product.id, quantity: { gte: quantity } },
          data: { quantity: { decrement: quantity } },
        });

        if (stockUpdate.count === 0) {
          throw new Error("Estoque insuficiente.");
        }

        totalValue += product.price.toNumber() * quantity;
      }

      const priceByProduct = new Map(products.map((product) => [product.id, product.price]));

      return await transaction.voucherOrder.create({
        data: {
          userId: validSession.user.id,
          status: "pending",
          vouchers: {
            create: Array.from(quantityByProduct, ([productId, quantity]) => ({
              userId: validSession.user.id,
              productId,
              quantity,
              unitPrice: priceByProduct.get(productId)!,
            })),
          },
          voucherPayments: {
            create: {
              userId: validSession.user.id,
              method: parsedVoucher.data.method,
              status: "pending",
              totalValue: totalValue,
            },
          },
        },
        include: { vouchers: true, voucherPayments: true },
      });
    });

    return {
      id: newOrder.id,
      status: newOrder.status,
      method: newOrder.voucherPayments[0].method,
      paymentStatus: newOrder.voucherPayments[0].status,
      totalValue: newOrder.voucherPayments[0].totalValue,

      vouchers: newOrder.vouchers.map((newVoucher) => ({
        id: newVoucher.id,
        productId: newVoucher.productId,
        quantity: newVoucher.quantity,
      })),

      createdAt: newOrder.createdAt.toISOString(),
      updatedAt: newOrder.updatedAt.toISOString(),
    };
  } catch {
    return false;
  }
};

export { buyVouchers };
