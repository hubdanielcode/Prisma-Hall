import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { formattedDate, formattedDateToISOString, formattedDateToString, formattedStringToDate, parsedDate } from "@/shared/utils/functions/dates";

/* - Funções e dados auxiliares - */

// As funções de formatação usam o fuso do computador, então os testes montam as datas com o construtor local (e não com "Z") para passarem em qualquer fuso

const buildLocalISOString = (year: number, monthIndex: number, day: number, hours = 0, minutes = 0, seconds = 0) =>
  new Date(year, monthIndex, day, hours, minutes, seconds).toISOString();

// O filtro de período usa o horário de Brasília (UTC-3). Quinta-feira, 14/05/2026, 12:00 em Brasília

const now = new Date("2026-05-14T15:00:00.000Z");

const setNow = (isoDate: string) => {
  vi.setSystemTime(new Date(isoDate));
};

const buildInterval = (intervalStart: string | number, intervalEnd: string) => ({
  intervalStart: typeof intervalStart === "number" ? intervalStart : new Date(intervalStart).getTime(),
  intervalEnd: new Date(intervalEnd).getTime(),
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a conversão de DD/MM/YYYY para Date - */

test("should convert a DD/MM/YYYY string to a Date at the start of that day", () => {
  const result = parsedDate("05/01/2026");

  expect(result).toBeInstanceOf(Date);
  expect(result.toISOString()).toBe("2026-01-05T00:00:00.000Z");
});

test.each([
  ["the last day of the year", "31/12/2026", "2026-12-31T00:00:00.000Z"],
  ["a leap day", "29/02/2028", "2028-02-29T00:00:00.000Z"],
])("should convert %s", (_description, date, expected) => {
  expect(parsedDate(date).toISOString()).toBe(expected);
});

test.each([
  ["an empty string", ""],
  ["a text that is not a date", "not a date"],
  ["a date with a month that does not exist", "05/13/2026"],
])("should return an invalid date when the input is %s", (_description, date) => {
  expect(Number.isNaN(parsedDate(date).getTime())).toBe(true);
});

/* - Testando a separação da data ISO em partes - */

test("should split an ISO date in the name of the day, the day, the month, the year and the time", () => {
  const result = formattedDate(buildLocalISOString(2026, 0, 5, 9, 30));

  expect(result).toEqual({
    dayName: "segunda-feira",
    dayNumber: 5,
    month: "janeiro",
    year: 2026,
    time: "09:30",
    timeWithSeconds: "09:30:00",
  });
});

test("should include the seconds only in the time with seconds", () => {
  const result = formattedDate(buildLocalISOString(2026, 11, 25, 18, 5, 9));

  expect(result.dayName).toBe("sexta-feira");
  expect(result.month).toBe("dezembro");
  expect(result.time).toBe("18:05");
  expect(result.timeWithSeconds).toBe("18:05:09");
});

test("should format midnight as 00:00", () => {
  const result = formattedDate(buildLocalISOString(2026, 0, 5));

  expect(result.time).toBe("00:00");
  expect(result.timeWithSeconds).toBe("00:00:00");
});

test("should return the day and the year as numbers", () => {
  const result = formattedDate(buildLocalISOString(2026, 0, 5, 9, 30));

  expect(result.dayNumber).toBeTypeOf("number");
  expect(result.year).toBeTypeOf("number");
});

test("should return NaN in the day and in the year when the date is not valid", () => {
  const result = formattedDate("not a date");

  expect(result.dayNumber).toBeNaN();
  expect(result.year).toBeNaN();
});

/* - Testando a formatação de Date em DD/MM/YYYY - */

test.each([
  ["a day and a month with two digits", new Date(2026, 11, 25), "25/12/2026"],
  ["a day and a month with one digit, filling them with zero", new Date(2026, 0, 5), "05/01/2026"],
  ["the last day of the year", new Date(2026, 11, 31), "31/12/2026"],
  ["a leap day", new Date(2028, 1, 29), "29/02/2028"],
])("should format %s", (_description, date, expected) => {
  expect(formattedDateToString(date)).toBe(expected);
});

test("should ignore the time of the day when formatting", () => {
  expect(formattedDateToString(new Date(2026, 0, 5, 23, 59, 59))).toBe("05/01/2026");
});

test("should return NaN in the parts of an invalid date", () => {
  expect(formattedDateToString(new Date("not a date"))).toBe("NaN/NaN/NaN");
});

/* - Testando a montagem da data ISO - */

test("should build the ISO string of the day and the time that came in", () => {
  const result = formattedDateToISOString(2026, 0, 5, "09:30");

  const date = new Date(result);

  expect(date.getFullYear()).toBe(2026);
  expect(date.getMonth()).toBe(0);
  expect(date.getDate()).toBe(5);
  expect(date.getHours()).toBe(9);
  expect(date.getMinutes()).toBe(30);
});

test("should return the date as an ISO string", () => {
  const result = formattedDateToISOString(2026, 0, 5, "09:30");

  expect(result).toBe(buildLocalISOString(2026, 0, 5, 9, 30));
  expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
});

test.each([
  ["the first minute of the day", "00:00", 0, 0],
  ["the last minute of the day", "23:59", 23, 59],
])("should accept %s", (_description, time, hours, minutes) => {
  const date = new Date(formattedDateToISOString(2026, 0, 5, time));

  expect(date.getHours()).toBe(hours);
  expect(date.getMinutes()).toBe(minutes);
});

test.each([
  ["an empty time", ""],
  ["a time with one digit in the hour", "9:30"],
  ["an hour above 23", "24:00"],
  ["minutes above 59", "12:60"],
  ["a time with seconds", "09:30:00"],
  ["a text that is not a time", "not a time"],
])("should use midnight when the time is %s", (_description, time) => {
  const result = formattedDateToISOString(2026, 0, 5, time);

  expect(result).toBe(buildLocalISOString(2026, 0, 5));
});

test("should move to the next year when the month index goes past December", () => {
  const date = new Date(formattedDateToISOString(2026, 12, 5, "10:00"));

  expect(date.getFullYear()).toBe(2027);
  expect(date.getMonth()).toBe(0);
  expect(date.getDate()).toBe(5);
});

/* - Testando o intervalo de cada período do filtro - */

test.each([
  ["today", "today", "2026-05-14T03:00:00.000Z", "2026-05-15T03:00:00.000Z"],
  ["this week, starting on Sunday", "this week", "2026-05-10T03:00:00.000Z", "2026-05-17T03:00:00.000Z"],
  ["this month", "this month", "2026-05-01T03:00:00.000Z", "2026-06-01T03:00:00.000Z"],
  ["the two-month period", "two-month period", "2026-05-01T03:00:00.000Z", "2026-07-01T03:00:00.000Z"],
  ["the three-month period", "three-month period", "2026-04-01T03:00:00.000Z", "2026-07-01T03:00:00.000Z"],
  ["the four-month period", "four-month period", "2026-05-01T03:00:00.000Z", "2026-09-01T03:00:00.000Z"],
  ["the six-month period", "six-month period", "2026-01-01T03:00:00.000Z", "2026-07-01T03:00:00.000Z"],
  ["this year", "this year", "2026-01-01T03:00:00.000Z", "2027-01-01T03:00:00.000Z"],
] as const)("should return the interval of %s", (_description, label, intervalStart, intervalEnd) => {
  expect(formattedStringToDate(label)).toEqual(buildInterval(intervalStart, intervalEnd));
});

test("should start all periods at zero and end it at the end of today", () => {
  expect(formattedStringToDate("all periods")).toEqual(buildInterval(0, "2026-05-15T03:00:00.000Z"));
});

test("should return only the start and the end of the interval, as numbers", () => {
  const result = formattedStringToDate("today");

  expect(Object.keys(result)).toEqual(["intervalStart", "intervalEnd"]);
  expect(result.intervalStart).toBeTypeOf("number");
  expect(result.intervalEnd).toBeTypeOf("number");
});

test("should return an interval of exactly 24 hours for today and 7 days for this week", () => {
  const today = formattedStringToDate("today");
  const thisWeek = formattedStringToDate("this week");

  expect(today.intervalEnd - today.intervalStart).toBe(24 * 60 * 60 * 1000);
  expect(thisWeek.intervalEnd - thisWeek.intervalStart).toBe(7 * 24 * 60 * 60 * 1000);
});

/* - Testando o horário de Brasília no filtro de período - */

test("should still be the previous day in Brasília before 03:00 UTC", () => {
  setNow("2026-05-14T02:59:59.000Z");

  expect(formattedStringToDate("today")).toEqual(buildInterval("2026-05-13T03:00:00.000Z", "2026-05-14T03:00:00.000Z"));
});

test("should be the next day in Brasília from 03:00 UTC", () => {
  setNow("2026-05-14T03:00:00.000Z");

  expect(formattedStringToDate("today")).toEqual(buildInterval("2026-05-14T03:00:00.000Z", "2026-05-15T03:00:00.000Z"));
});

test("should start the week on the same day when today is Sunday", () => {
  setNow("2026-05-10T15:00:00.000Z");

  expect(formattedStringToDate("this week")).toEqual(buildInterval("2026-05-10T03:00:00.000Z", "2026-05-17T03:00:00.000Z"));
});

test("should start the week on the previous month when the Sunday is in it", () => {
  setNow("2026-06-02T15:00:00.000Z");

  expect(formattedStringToDate("this week")).toEqual(buildInterval("2026-05-31T03:00:00.000Z", "2026-06-07T03:00:00.000Z"));
});

test("should still be the previous year in Brasília in the first hours of the new year in UTC", () => {
  setNow("2026-01-01T02:00:00.000Z");

  expect(formattedStringToDate("this year")).toEqual(buildInterval("2025-01-01T03:00:00.000Z", "2026-01-01T03:00:00.000Z"));
});

test("should end the last block of months on the first day of the next year", () => {
  setNow("2026-12-15T15:00:00.000Z");

  expect(formattedStringToDate("six-month period")).toEqual(buildInterval("2026-07-01T03:00:00.000Z", "2027-01-01T03:00:00.000Z"));
});

test("should end the month of December on the first day of the next year", () => {
  setNow("2026-12-15T15:00:00.000Z");

  expect(formattedStringToDate("this month")).toEqual(buildInterval("2026-12-01T03:00:00.000Z", "2027-01-01T03:00:00.000Z"));
});

test("should use the block that contains the current month in the first block of the year", () => {
  setNow("2026-02-10T15:00:00.000Z");

  expect(formattedStringToDate("three-month period")).toEqual(buildInterval("2026-01-01T03:00:00.000Z", "2026-04-01T03:00:00.000Z"));
});
