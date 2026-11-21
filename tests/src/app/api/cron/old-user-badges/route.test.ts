import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { GET } from "@/app/api/cron/old-user-badges/route";
import { recalculateOldUserBadges } from "@/lib/server/badges/achievementBadges";

/* - Mocks das dependências externas (server-only vem do vitest.setup) - */

vi.mock("@/lib/server/badges/achievementBadges", () => ({ recalculateOldUserBadges: vi.fn() }));

const mockRecalculateOldUserBadges = recalculateOldUserBadges as unknown as Mock;

/* - Funções e dados auxiliares - */

const cronSecret = "cron secret";

const buildRequest = (authorization?: string) =>
  new Request("http://localhost:3000/api/cron/old-user-badges", {
    method: "GET",
    headers: authorization === undefined ? {} : { authorization },
  });

beforeEach(() => {
  vi.stubEnv("CRON_SECRET", cronSecret);

  mockRecalculateOldUserBadges.mockResolvedValue(true);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/* - Testando a autorização - */

test.each([
  ["no authorization header", undefined],
  ["an empty authorization header", ""],
  ["a wrong secret", "Bearer wrong secret"],
  ["the secret without the Bearer prefix", cronSecret],
  ["another scheme", `Basic ${cronSecret}`],
  ["the secret with a different case", `Bearer ${cronSecret.toUpperCase()}`],
  ["extra characters after the secret", `Bearer ${cronSecret}x`],
])("should return 401 and skip the recalculation when the request has %s", async (_description, authorization) => {
  const response = await GET(buildRequest(authorization));

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({ error: "Não autorizado" });
  expect(mockRecalculateOldUserBadges).not.toHaveBeenCalled();
});

test.each([
  ["not set", undefined],
  ["empty", ""],
])("should return 401 for every request when the CRON_SECRET is %s", async (_description, secret) => {
  vi.stubEnv("CRON_SECRET", secret as string);

  const responses = await Promise.all([GET(buildRequest(`Bearer ${secret}`)), GET(buildRequest("Bearer ")), GET(buildRequest())]);

  for (const response of responses) {
    expect(response.status).toBe(401);
  }

  expect(mockRecalculateOldUserBadges).not.toHaveBeenCalled();
});

/* - Testando o resultado - */

test("should recalculate the old user badges and return success when the secret is valid", async () => {
  const response = await GET(buildRequest(`Bearer ${cronSecret}`));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ success: true });
  expect(mockRecalculateOldUserBadges).toHaveBeenCalledTimes(1);
});

/* - Testando as falhas - */

test("should return 500 when the recalculation fails", async () => {
  mockRecalculateOldUserBadges.mockResolvedValue(false);

  const response = await GET(buildRequest(`Bearer ${cronSecret}`));

  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Falha ao recalcular os badges de tempo de conta" });
});
