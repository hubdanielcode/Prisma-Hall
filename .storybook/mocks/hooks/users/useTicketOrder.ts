import { fakeEvents } from "../events/useEvents";
import { fn } from "storybook/test";
import type { TicketOrderProps } from "@/features/users/tickets/types/ticketOrder";

const fakeTicketOrders: TicketOrderProps[] = [
  {
    id: "id-do-pedido-fake-1",
    status: "confirmed",

    tickets: [
      {
        id: "id-do-ingresso-fake-1",
        eventId: fakeEvents[4].id,
        quantity: 2,
        unitPrice: 50,

        event: {
          id: fakeEvents[4].id,
          title: fakeEvents[4].title,
          tag: fakeEvents[4].tag,
          attractionName: fakeEvents[4].attractionName,
          image: fakeEvents[4].image,
          status: fakeEvents[4].status,
          startsAt: fakeEvents[4].startsAt,
        },
      },

      {
        id: "id-do-ingresso-fake-2",
        eventId: fakeEvents[5].id,
        quantity: 1,
        unitPrice: 50,

        event: {
          id: fakeEvents[5].id,
          title: fakeEvents[5].title,
          tag: fakeEvents[5].tag,
          attractionName: fakeEvents[5].attractionName,
          image: fakeEvents[5].image,
          status: fakeEvents[5].status,
          startsAt: fakeEvents[5].startsAt,
        },
      },
    ],

    payments: [
      {
        id: "id-do-pagamento-fake-1",
        method: "pix",
        status: "confirmed",
        totalValue: 165,
        confirmedAt: new Date("2026-09-01").toISOString(),

        createdAt: new Date("2026-09-01").toISOString(),
      },
    ],

    createdAt: new Date("2026-09-01").toISOString(),
    updatedAt: new Date("2026-09-01").toISOString(),
  },

  {
    id: "id-do-pedido-fake-2",
    status: "cancelled",

    tickets: [
      {
        id: "id-do-ingresso-fake-3",
        eventId: fakeEvents[6].id,
        quantity: 1,
        unitPrice: 50,

        event: {
          id: fakeEvents[6].id,
          title: fakeEvents[6].title,
          tag: fakeEvents[6].tag,
          attractionName: fakeEvents[6].attractionName,
          image: fakeEvents[6].image,
          status: fakeEvents[6].status,
          startsAt: fakeEvents[6].startsAt,
        },
      },
    ],

    payments: [
      {
        id: "id-do-pagamento-fake-2",
        method: "creditCard",
        status: "refunded",
        totalValue: 55,
        confirmedAt: new Date("2026-09-02").toISOString(),

        createdAt: new Date("2026-09-02").toISOString(),
      },
    ],

    createdAt: new Date("2026-09-02").toISOString(),
    updatedAt: new Date("2026-09-03").toISOString(),
  },
];

const fakeTicketOrder = fakeTicketOrders[0];

const useTicketOrder = () => ({
  order: fakeTicketOrder,
  isLoading: false,
  error: null,
  cancelTicketOrderMutation: fn(async () => true),
});

export { useTicketOrder, fakeTicketOrders, fakeTicketOrder };
