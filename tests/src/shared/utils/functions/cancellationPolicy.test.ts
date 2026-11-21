import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  getTicketCancellationDeadline,
  isTicketCancellationOpen,
  ticketCancellationDeadlineHours,
} from "@/shared/utils/functions/cancellationPolicy";

/* - Funções e dados auxiliares - */

const now = new Date("2026-06-01T12:00:00.000Z");
const eventStartsAt = new Date("2099-01-02T20:00:00.000Z");
const hour = 60 * 60 * 1000;
const deadlineInMilliseconds = ticketCancellationDeadlineHours * hour;

// Evento que começa daqui a "offset" milissegundos, a partir do "agora" fixo

const startsInMilliseconds = (offset: number) => new Date(now.getTime() + offset);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando o prazo configurado - */

// Se este valor mudar, a Política de Reembolso e o FAQ também precisam ser atualizados

test("should keep the cancellation deadline at 24 hours before the event", () => {
  expect(ticketCancellationDeadlineHours).toBe(24);
});

/* - Testando o cálculo do prazo de cancelamento - */

test("should return the moment that is the deadline hours before the start of the event", () => {
  const deadline = getTicketCancellationDeadline(eventStartsAt);

  expect(eventStartsAt.getTime() - deadline.getTime()).toBe(deadlineInMilliseconds);
});

test("should return the deadline as a Date", () => {
  const deadline = getTicketCancellationDeadline(eventStartsAt);

  expect(deadline).toBeInstanceOf(Date);
  expect(deadline.toISOString()).toBe("2099-01-01T20:00:00.000Z");
});

test("should calculate the deadline when the start of the event is an ISO string", () => {
  const deadline = getTicketCancellationDeadline("2099-01-02T20:00:00.000Z");

  expect(deadline.toISOString()).toBe("2099-01-01T20:00:00.000Z");
});

test("should return the same deadline for a Date and for its ISO string", () => {
  expect(getTicketCancellationDeadline(eventStartsAt).getTime()).toBe(getTicketCancellationDeadline(eventStartsAt.toISOString()).getTime());
});

test("should move the deadline to the previous month and year when the event starts on the first day of the year", () => {
  const deadline = getTicketCancellationDeadline("2099-01-01T10:00:00.000Z");

  expect(deadline.toISOString()).toBe("2098-12-31T10:00:00.000Z");
});

test("should not change the date it receives when calculating the deadline", () => {
  const input = new Date("2099-01-02T20:00:00.000Z");

  getTicketCancellationDeadline(input);

  expect(input.toISOString()).toBe("2099-01-02T20:00:00.000Z");
});

test("should return an invalid date when the start of the event is not a valid date", () => {
  const deadline = getTicketCancellationDeadline("not a date");

  expect(Number.isNaN(deadline.getTime())).toBe(true);
});

/* - Testando o cancelamento aberto - */

test.each([
  ["a week before the event", 7 * 24 * hour],
  ["two days before the event", 48 * hour],
  ["one millisecond before the deadline", deadlineInMilliseconds + 1],
])("should return true when it is %s", (_description, offset) => {
  expect(isTicketCancellationOpen(startsInMilliseconds(offset))).toBe(true);
});

/* - Testando o cancelamento fechado - */

// O prazo é estrito: no instante exato do limite o cancelamento já não é aceito

test.each([
  ["exactly at the deadline", deadlineInMilliseconds],
  ["one millisecond after the deadline", deadlineInMilliseconds - 1],
  ["one hour before the event", hour],
  ["at the start of the event", 0],
  ["after the event was held", -hour],
])("should return false when it is %s", (_description, offset) => {
  expect(isTicketCancellationOpen(startsInMilliseconds(offset))).toBe(false);
});

/* - Testando os formatos aceitos e a mudança do relógio - */

test("should check the cancellation when the start of the event is an ISO string", () => {
  expect(isTicketCancellationOpen(startsInMilliseconds(48 * hour).toISOString())).toBe(true);
  expect(isTicketCancellationOpen(startsInMilliseconds(hour).toISOString())).toBe(false);
});

test("should return false when the start of the event is not a valid date", () => {
  expect(isTicketCancellationOpen("not a date")).toBe(false);
});

test("should close the cancellation when the time passes the deadline", () => {
  const startsAt = startsInMilliseconds(deadlineInMilliseconds + 1000);

  expect(isTicketCancellationOpen(startsAt)).toBe(true);

  vi.setSystemTime(new Date(now.getTime() + 1000));

  expect(isTicketCancellationOpen(startsAt)).toBe(false);
});
