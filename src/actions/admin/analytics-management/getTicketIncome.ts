"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { formattedStringToDate } from "@/shared/utils/functions/dates";
import { prisma } from "@/lib/prisma";
import { ticketIncomeSchema } from "@/lib/validations";
import z from "zod";

const getTicketIncome = async (ticketIncome: z.infer<typeof ticketIncomeSchema>) => {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedTicketIncome = ticketIncomeSchema.safeParse(ticketIncome);

  if (!parsedTicketIncome.success) {
    return false;
  }

  const label = parsedTicketIncome.data.label;
  const name = parsedTicketIncome.data.name;
  const tag = parsedTicketIncome.data.tag;

  const { intervalStart, intervalEnd } = formattedStringToDate(label);

  const startDate = new Date(intervalStart);
  const endDate = new Date(intervalEnd);

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        event: { tag, ...(name ? { title: name } : {}) },
        order: {
          ticketPayments: {
            some: { status: "confirmed", confirmedAt: { gte: startDate, lt: endDate } },
          },
        },
      },
      select: { quantity: true, unitPrice: true },
    });

    const totalIncome = tickets.reduce((accumulator, ticket) => accumulator + ticket.quantity * ticket.unitPrice.toNumber(), 0);

    return { totalIncome };
  } catch {
    return false;
  }
};

export { getTicketIncome };
