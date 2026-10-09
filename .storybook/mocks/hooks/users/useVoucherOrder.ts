import { fn } from "storybook/test";
import { fakeProducts } from "../bar/useProducts";
import type { VoucherOrderProps } from "@/features/users/vouchers/types/voucherOrder";

const fakeVoucherOrders: VoucherOrderProps[] = [
  {
    id: "id-do-pedido-de-voucher-fake-1",
    status: "confirmed",

    vouchers: [
      {
        id: "id-do-voucher-fake-1",
        productId: fakeProducts[0].id,
        quantity: 2,
        product: fakeProducts[0],
      },
    ],

    payments: [
      {
        id: "id-do-pagamento-de-voucher-fake-1",
        method: "pix",
        status: "confirmed",
        totalValue: fakeProducts[0].price * 2,
        pickedUpAt: null,
        createdAt: new Date("2026-09-01").toISOString(),
      },
    ],

    createdAt: new Date("2026-09-01").toISOString(),
    updatedAt: new Date("2026-09-01").toISOString(),
  },

  {
    id: "id-do-pedido-de-voucher-fake-2",
    status: "cancelled",

    vouchers: [
      {
        id: "id-do-voucher-fake-2",
        productId: fakeProducts[2].id,
        quantity: 1,
        product: fakeProducts[2],
      },
    ],

    payments: [
      {
        id: "id-do-pagamento-de-voucher-fake-2",
        method: "creditCard",
        status: "refunded",
        totalValue: fakeProducts[2].price,
        pickedUpAt: null,
        createdAt: new Date("2026-09-02").toISOString(),
      },
    ],

    createdAt: new Date("2026-09-02").toISOString(),
    updatedAt: new Date("2026-09-03").toISOString(),
  },
];

const fakeVoucherOrder = fakeVoucherOrders[0];

const useVoucherOrder = () => ({
  order: fakeVoucherOrder,
  isLoading: false,
  error: null,
  cancelVoucherOrderMutation: fn(async () => true),
});

export { useVoucherOrder, fakeVoucherOrders, fakeVoucherOrder };
