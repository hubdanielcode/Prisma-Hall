import { fn } from "storybook/test";
import type { PickupOrderProps } from "@/features/admin/pickup-management/types/pickupOrder";

const fakePickupOrders: PickupOrderProps[] = [
  {
    id: "a1b2c3d4-0000-4000-8000-000000000001",
    type: "tickets",
    status: "confirmed",

    user: { name: "Usuário Fake Um", email: "usuario.fake.1@gmail.com" },

    items: [{ id: "id-do-item-fake-1", name: "Evento Fake Um", quantity: 2 }],

    payment: {
      id: "id-do-pagamento-fake-1",
      method: "pix",
      status: "confirmed",
      totalValue: 110,
      confirmedAt: new Date("2026-09-01").toISOString(),
      pickedUpAt: null,
    },

    blockReason: null,

    createdAt: new Date("2026-09-01").toISOString(),
  },

  {
    id: "b2c3d4e5-0000-4000-8000-000000000002",
    type: "tickets",
    status: "pending",

    user: { name: "Usuário Fake Dois", email: "usuario.fake.2@hotmail.com" },

    items: [{ id: "id-do-item-fake-2", name: "Evento Fake Dois", quantity: 1 }],

    payment: {
      id: "id-do-pagamento-fake-2",
      method: "pix",
      status: "pending",
      totalValue: 55,
      confirmedAt: null,
      pickedUpAt: null,
    },

    blockReason: "payment_pending",

    createdAt: new Date("2026-09-02").toISOString(),
  },

  {
    id: "c3d4e5f6-0000-4000-8000-000000000003",
    type: "tickets",
    status: "cancelled",

    user: { name: "Usuário Fake Três", email: "usuario.fake.3@outlook.com" },

    items: [{ id: "id-do-item-fake-3", name: "Evento Fake Três", quantity: 1 }],

    payment: {
      id: "id-do-pagamento-fake-3",
      method: "creditCard",
      status: "refunded",
      totalValue: 55,
      confirmedAt: new Date("2026-09-03").toISOString(),
      pickedUpAt: null,
    },

    blockReason: "order_cancelled",

    createdAt: new Date("2026-09-03").toISOString(),
  },

  {
    id: "d4e5f6a7-0000-4000-8000-000000000004",
    type: "tickets",
    status: "confirmed",

    user: { name: "Usuário Fake Quatro", email: "usuario.fake.4@gmail.com" },

    items: [{ id: "id-do-item-fake-4", name: "Evento Fake Quatro", quantity: 3 }],

    payment: {
      id: "id-do-pagamento-fake-4",
      method: "debitCard",
      status: "confirmed",
      totalValue: 165,
      confirmedAt: new Date("2026-09-04").toISOString(),
      pickedUpAt: new Date("2026-09-10").toISOString(),
    },

    blockReason: "already_picked_up",

    createdAt: new Date("2026-09-04").toISOString(),
  },
];

const usePickup = () => ({
  orders: fakePickupOrders,
  isLoading: false,
  error: false,
  registerPickupMutation: fn(async () => true as const),
});

export { usePickup, fakePickupOrders };
