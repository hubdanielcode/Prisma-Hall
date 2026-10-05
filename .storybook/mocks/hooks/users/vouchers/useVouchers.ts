import type { VoucherProps } from "@/features/users/vouchers/types/voucher";
import { fakeProducts } from "../../bar/useProducts";

const fakeVouchers: VoucherProps[] = [
  {
    id: "id-do-voucher-fake-1",
    orderId: "id-do-pedido-de-voucher-fake-1",
    productId: fakeProducts[0].id,
    quantity: 2,
    orderStatus: "confirmed",
    paymentStatus: "confirmed",
    pickedUpAt: null,
    product: fakeProducts[0],

    createdAt: new Date("2026-09-01").toISOString(),
    updatedAt: new Date("2026-09-01").toISOString(),
  },

  {
    id: "id-do-voucher-fake-2",
    orderId: "id-do-pedido-de-voucher-fake-2",
    productId: fakeProducts[2].id,
    quantity: 1,
    orderStatus: "confirmed",
    paymentStatus: "confirmed",
    pickedUpAt: new Date("2026-09-20").toISOString(),
    product: fakeProducts[2],

    createdAt: new Date("2026-09-02").toISOString(),
    updatedAt: new Date("2026-09-02").toISOString(),
  },

  {
    id: "id-do-voucher-fake-3",
    orderId: "id-do-pedido-de-voucher-fake-3",
    productId: fakeProducts[4].id,
    quantity: 3,
    orderStatus: "pending",
    paymentStatus: "pending",
    pickedUpAt: null,
    product: fakeProducts[4],

    createdAt: new Date("2026-09-03").toISOString(),
    updatedAt: new Date("2026-09-03").toISOString(),
  },

  {
    id: "id-do-voucher-fake-4",
    orderId: "id-do-pedido-de-voucher-fake-4",
    productId: fakeProducts[6].id,
    quantity: 4,
    orderStatus: "cancelled",
    paymentStatus: "refunded",
    pickedUpAt: null,
    product: fakeProducts[6],

    createdAt: new Date("2026-09-04").toISOString(),
    updatedAt: new Date("2026-09-04").toISOString(),
  },
];

const fakeVoucher = fakeVouchers[0];

const useVouchers = () => ({
  vouchers: fakeVouchers,
  isLoading: false,
  error: null,
});

export { useVouchers, fakeVouchers, fakeVoucher };
