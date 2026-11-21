import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getShoppingHistory } from "@/actions/users/user/getShoppingHistory";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindManyTicketOrders = prisma.ticketOrder.findMany as unknown as Mock;
const mockFindManyVoucherOrders = prisma.voucherOrder.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O unitPrice e o totalValue do Prisma são Decimal, por isso os mocks têm o método toNumber

const buildDatabaseTicketOrder = (overrides: Record<string, unknown> = {}) => ({
  id: "ticket order 1",
  status: "confirmed",

  tickets: [
    {
      id: "ticket 1",
      quantity: 2,
      unitPrice: { toNumber: () => 50 },
      event: { title: "Rock na Praça", image: "https://blob.vercel-storage.com/1700000000000-event.png" },
    },
  ],

  ticketPayments: [{ method: "pix", status: "confirmed", totalValue: { toNumber: () => 110 } }],
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const buildDatabaseVoucherOrder = (overrides: Record<string, unknown> = {}) => ({
  id: "voucher order 1",
  status: "pending",

  vouchers: [
    {
      id: "voucher 1",
      quantity: 3,
      unitPrice: { toNumber: () => 12.5 },
      product: { name: "Heineken", image: "https://blob.vercel-storage.com/1700000000000-heineken.png" },
    },
  ],

  voucherPayments: [{ method: "creditCard", status: "pending", totalValue: { toNumber: () => 41.25 } }],
  createdAt: new Date("2026-01-12T12:00:00.000Z"),
  updatedAt: new Date("2026-01-13T12:00:00.000Z"),
  ...overrides,
});

const expectedTicketOrder = {
  id: "ticket order 1",
  type: "tickets",
  status: "confirmed",
  paymentMethod: "pix",
  paymentStatus: "confirmed",
  totalValue: 110,
  items: [{ id: "ticket 1", name: "Rock na Praça", image: "https://blob.vercel-storage.com/1700000000000-event.png", quantity: 2, unitPrice: 50 }],
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
};

const expectedVoucherOrder = {
  id: "voucher order 1",
  type: "vouchers",
  status: "pending",
  paymentMethod: "creditCard",
  paymentStatus: "pending",
  totalValue: 41.25,
  items: [{ id: "voucher 1", name: "Heineken", image: "https://blob.vercel-storage.com/1700000000000-heineken.png", quantity: 3, unitPrice: 12.5 }],
  createdAt: "2026-01-12T12:00:00.000Z",
  updatedAt: "2026-01-13T12:00:00.000Z",
};

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindManyTicketOrders.mockResolvedValue([buildDatabaseTicketOrder()]);
  mockFindManyVoucherOrders.mockResolvedValue([buildDatabaseVoucherOrder()]);
});

/* - Testando a sessão - */

test("should throw an error and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  await expect(getShoppingHistory()).rejects.toThrow("Acesso negado.");

  expect(mockFindManyTicketOrders).not.toHaveBeenCalled();
  expect(mockFindManyVoucherOrders).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the ticket orders of the user with the tickets, the events and the latest payment", async () => {
  await getShoppingHistory();

  expect(mockFindManyTicketOrders).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    include: {
      tickets: { include: { event: true } },
      ticketPayments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
});

test("should look for the voucher orders of the user with the vouchers, the products and the latest payment", async () => {
  await getShoppingHistory();

  expect(mockFindManyVoucherOrders).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    include: {
      vouchers: { include: { product: true } },
      voucherPayments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
});

/* - Testando o resultado - */

test("should return the ticket orders and the voucher orders with the values as numbers and the dates as ISO strings", async () => {
  const result = await getShoppingHistory();

  expect(result).toEqual([expectedVoucherOrder, expectedTicketOrder]);
});

test("should sort every order from the newest to the oldest, mixing tickets and vouchers", async () => {
  mockFindManyTicketOrders.mockResolvedValue([
    buildDatabaseTicketOrder({ id: "ticket order 1", createdAt: new Date("2026-01-10T12:00:00.000Z") }),
    buildDatabaseTicketOrder({ id: "ticket order 2", createdAt: new Date("2026-01-14T12:00:00.000Z") }),
  ]);
  mockFindManyVoucherOrders.mockResolvedValue([
    buildDatabaseVoucherOrder({ id: "voucher order 1", createdAt: new Date("2026-01-12T12:00:00.000Z") }),
    buildDatabaseVoucherOrder({ id: "voucher order 2", createdAt: new Date("2026-01-08T12:00:00.000Z") }),
  ]);

  const result = await getShoppingHistory();

  expect(result.map((order) => order.id)).toEqual(["ticket order 2", "voucher order 1", "ticket order 1", "voucher order 2"]);
});

test("should add up the items when a ticket order has no payment, and return no payment method or status", async () => {
  mockFindManyTicketOrders.mockResolvedValue([
    buildDatabaseTicketOrder({
      ticketPayments: [],

      tickets: [
        { id: "ticket 1", quantity: 2, unitPrice: { toNumber: () => 50 }, event: { title: "Rock na Praça", image: "image 1" } },
        { id: "ticket 2", quantity: 1, unitPrice: { toNumber: () => 30 }, event: { title: "Samba na Praça", image: "image 2" } },
      ],
    }),
  ]);
  mockFindManyVoucherOrders.mockResolvedValue([]);

  const result = await getShoppingHistory();

  expect(result).toEqual([expect.objectContaining({ paymentMethod: null, paymentStatus: null, totalValue: 130 })]);
});

test("should add up the items when a voucher order has no payment, and return no payment method or status", async () => {
  mockFindManyTicketOrders.mockResolvedValue([]);
  mockFindManyVoucherOrders.mockResolvedValue([
    buildDatabaseVoucherOrder({
      voucherPayments: [],

      vouchers: [
        { id: "voucher 1", quantity: 2, unitPrice: { toNumber: () => 12.5 }, product: { name: "Heineken", image: "image 1" } },
        { id: "voucher 2", quantity: 3, unitPrice: { toNumber: () => 8 }, product: { name: "Água", image: "image 2" } },
      ],
    }),
  ]);

  const result = await getShoppingHistory();

  expect(result).toEqual([expect.objectContaining({ paymentMethod: null, paymentStatus: null, totalValue: 49 })]);
});

test("should return the value of the payment and not the sum of the items when the order has a payment", async () => {
  mockFindManyTicketOrders.mockResolvedValue([
    buildDatabaseTicketOrder({ ticketPayments: [{ method: "pix", status: "confirmed", totalValue: { toNumber: () => 999 } }] }),
  ]);
  mockFindManyVoucherOrders.mockResolvedValue([]);

  const result = await getShoppingHistory();

  expect(result).toEqual([expect.objectContaining({ totalValue: 999 })]);
});

test("should return only the ticket orders when the user has no voucher orders", async () => {
  mockFindManyVoucherOrders.mockResolvedValue([]);

  const result = await getShoppingHistory();

  expect(result).toEqual([expectedTicketOrder]);
});

test("should return only the voucher orders when the user has no ticket orders", async () => {
  mockFindManyTicketOrders.mockResolvedValue([]);

  const result = await getShoppingHistory();

  expect(result).toEqual([expectedVoucherOrder]);
});

test("should return an empty list when the user has no orders", async () => {
  mockFindManyTicketOrders.mockResolvedValue([]);
  mockFindManyVoucherOrders.mockResolvedValue([]);

  const result = await getShoppingHistory();

  expect(result).toEqual([]);
});

/* - Testando as falhas - */

test.each([
  ["looking for the ticket orders", () => mockFindManyTicketOrders],
  ["looking for the voucher orders", () => mockFindManyVoucherOrders],
])("should throw an error when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  await expect(getShoppingHistory()).rejects.toThrow("Erro ao buscar histórico de compras.");
});
