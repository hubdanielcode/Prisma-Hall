import type { TicketProps } from "@/features/users/tickets/types/ticket";
import { fakeEvents } from "../events/useEvents";

const fakeTickets: TicketProps[] = [
  {
    id: "id-do-ingresso-fake-1",
    orderId: "id-do-pedido-fake-1",
    eventId: fakeEvents[4].id,
    quantity: 2,
    unitPrice: 50,
    orderStatus: "confirmed",
    paymentStatus: "confirmed",
    pickedUpAt: null,
    event: fakeEvents[4],

    createdAt: new Date("2026-09-01").toISOString(),
    updatedAt: new Date("2026-09-01").toISOString(),
  },

  {
    id: "id-do-ingresso-fake-2",
    orderId: "id-do-pedido-fake-2",
    eventId: fakeEvents[5].id,
    quantity: 1,
    unitPrice: 50,
    orderStatus: "confirmed",
    paymentStatus: "confirmed",
    pickedUpAt: new Date("2026-10-02").toISOString(),
    event: fakeEvents[5],

    createdAt: new Date("2026-09-02").toISOString(),
    updatedAt: new Date("2026-09-02").toISOString(),
  },

  {
    id: "id-do-ingresso-fake-3",
    orderId: "id-do-pedido-fake-3",
    eventId: fakeEvents[6].id,
    quantity: 3,
    unitPrice: 50,
    orderStatus: "pending",
    paymentStatus: "pending",
    pickedUpAt: null,
    event: fakeEvents[6],

    createdAt: new Date("2026-09-03").toISOString(),
    updatedAt: new Date("2026-09-03").toISOString(),
  },

  {
    id: "id-do-ingresso-fake-4",
    orderId: "id-do-pedido-fake-4",
    eventId: fakeEvents[7].id,
    quantity: 1,
    unitPrice: 50,
    orderStatus: "cancelled",
    paymentStatus: "refunded",
    pickedUpAt: null,
    event: fakeEvents[7],

    createdAt: new Date("2026-09-04").toISOString(),
    updatedAt: new Date("2026-09-04").toISOString(),
  },

  {
    id: "id-do-ingresso-fake-5",
    orderId: "id-do-pedido-fake-5",
    eventId: fakeEvents[0].id,
    quantity: 2,
    unitPrice: 50,
    orderStatus: "confirmed",
    paymentStatus: "confirmed",
    pickedUpAt: new Date("2026-08-12").toISOString(),
    event: fakeEvents[0],

    createdAt: new Date("2026-08-10").toISOString(),
    updatedAt: new Date("2026-08-10").toISOString(),
  },

  {
    id: "id-do-ingresso-fake-6",
    orderId: "id-do-pedido-fake-6",
    eventId: fakeEvents[1].id,
    quantity: 1,
    unitPrice: 50,
    orderStatus: "cancelled",
    paymentStatus: "failed",
    pickedUpAt: null,
    event: fakeEvents[1],

    createdAt: new Date("2026-08-11").toISOString(),
    updatedAt: new Date("2026-08-11").toISOString(),
  },
];

const useTickets = () => ({
  tickets: fakeTickets,
  isLoading: false,
  error: null,
});

export { useTickets, fakeTickets };
