"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { formattedStringToDate } from "@/shared/utils/functions/dates";
import { newVisitorsSchema, tagSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import z from "zod";

const getNewVisitors = async (newVisitor: z.infer<typeof newVisitorsSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedNewVisitor = newVisitorsSchema.safeParse(newVisitor);

  if (!parsedNewVisitor.success) {
    return false;
  }

  const { intervalStart, intervalEnd } = formattedStringToDate(parsedNewVisitor.data.label);

  const startDate = new Date(intervalStart);
  const endDate = new Date(intervalEnd);

  try {
    const newUsers = await prisma.user.count({
      where: { validatedAt: { gte: startDate, lt: endDate } },
    });

    const confirmedPayments = await prisma.ticketPayment.findMany({
      where: { status: "confirmed", confirmedAt: { not: null } },
      distinct: ["userId"],
      orderBy: { confirmedAt: "asc" },
      select: {
        userId: true,
        confirmedAt: true,
        order: {
          select: {
            tickets: {
              select: {
                event: {
                  select: { tag: true },
                },
              },
            },
          },
        },
      },
    });

    const firstPurchaseFromEachUser = confirmedPayments.filter((payment) => payment.confirmedAt && payment.confirmedAt >= startDate);

    const buyersList = firstPurchaseFromEachUser.map((payment) => ({
      userId: payment.userId,
      tags: payment.order.tickets.map((ticket) => ticket.event.tag),
    }));

    const buyersByTag = tagSchema.options.map((eventTag) => ({
      tag: eventTag,
      totalBuyers: buyersList.filter((buyer) => buyer.tags.includes(eventTag)).length,
    }));

    if (parsedNewVisitor.data.tag === "all_tags") {
      return { newUsers, buyers: buyersList.length, buyersByTag };
    }

    const selectedTag = buyersByTag.filter((event) => event.tag === parsedNewVisitor.data.tag);

    return { newUsers, buyers: selectedTag[0].totalBuyers, buyersByTag: selectedTag };
  } catch {
    return false;
  }
};

export { getNewVisitors };
