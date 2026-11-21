import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";

/* - Mocks das dependências externas (stripe) - */

// Criado com vi.hoisted para continuar o mesmo depois do vi.resetModules

const { mockStripe } = vi.hoisted(() => ({ mockStripe: vi.fn(function () {}) }));

vi.mock("stripe", () => ({ Stripe: mockStripe }));

/* - Funções e dados auxiliares - */

const secretKey = "sk_test_chave-secreta";

const loadStripeService = async () => {
  vi.resetModules();

  return import("@/lib/server/services/stripe");
};

beforeEach(() => {
  vi.stubEnv("STRIPE_SECRET_KEY", secretKey);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/* - Testando a criação do cliente - */

test("should create the stripe client with the secret key from the environment", async () => {
  await loadStripeService();

  expect(mockStripe).toHaveBeenCalledTimes(1);
  expect(mockStripe).toHaveBeenCalledWith(secretKey);
});

/* - Testando o resultado - */

test("should export the client that was created", async () => {
  const { stripe } = await loadStripeService();

  expect(stripe).toBe((mockStripe as Mock).mock.instances[0]);
});
