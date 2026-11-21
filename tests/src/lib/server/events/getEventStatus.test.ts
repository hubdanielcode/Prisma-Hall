import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { getEventStatus } from "@/lib/server";

/* - Funções e dados auxiliares - */

const now = new Date("2026-06-15T12:00:00.000Z");
const pastDate = new Date("2020-01-01T00:00:00.000Z");
const futureDate = new Date("2099-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando evento cancelado - */

test.each([
  ["in the future", futureDate],
  ["in the past", pastDate],
])("should return cancelled when the event is cancelled and starts %s", (_description, startsAt) => {
  expect(getEventStatus({ isCancelled: true, startsAt })).toBe("cancelled");
});

/* - Testando evento ativo - */

test("should return soon when the event has not started yet", () => {
  expect(getEventStatus({ isCancelled: false, startsAt: futureDate })).toBe("soon");
});

test("should return happened when the event already started", () => {
  expect(getEventStatus({ isCancelled: false, startsAt: pastDate })).toBe("happened");
});

test("should return happened when the event starts exactly now", () => {
  expect(getEventStatus({ isCancelled: false, startsAt: new Date(now) })).toBe("happened");
});

test("should return soon when the event starts one millisecond from now", () => {
  expect(getEventStatus({ isCancelled: false, startsAt: new Date(now.getTime() + 1) })).toBe("soon");
});
