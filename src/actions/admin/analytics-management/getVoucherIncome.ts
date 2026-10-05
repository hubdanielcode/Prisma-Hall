"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { formattedStringToDate } from "@/shared/utils/functions/dates";
import { prisma } from "@/lib/prisma";
import { voucherIncomeSchema } from "@/lib/validations";
import z from "zod";

const getVoucherIncome = async (voucherIncome: z.infer<typeof voucherIncomeSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedVoucherIncome = voucherIncomeSchema.safeParse(voucherIncome);

  if (!parsedVoucherIncome.success) {
    return false;
  }

  const { intervalStart } = formattedStringToDate(parsedVoucherIncome.data.label);
  const startDate = new Date(intervalStart);

  try {
    const vouchers = await prisma.voucher.findMany({
      where: {
        order: { voucherPayment: { some: { status: "confirmed", createdAt: { gte: startDate } } } },
        product: {
          category: parsedVoucherIncome.data.category,
          ...(parsedVoucherIncome.data.name ? { name: parsedVoucherIncome.data.name } : {}),
        },
      },
      select: {
        quantity: true,
        product: { select: { name: true, price: true } },
      },
    });

    const incomeByProduct = new Map<string, number>();

    vouchers.forEach((voucher) => {
      const income = voucher.product.price.toNumber() * voucher.quantity;
      const currentIncome = incomeByProduct.get(voucher.product.name) ?? 0;

      incomeByProduct.set(voucher.product.name, currentIncome + income);
    });

    const products = Array.from(incomeByProduct, ([name, income]) => ({ name, income }));
    const totalIncome = products.reduce((accumulator, product) => accumulator + product.income, 0);

    return { totalIncome, products };
  } catch {
    return false;
  }
};

export { getVoucherIncome };
