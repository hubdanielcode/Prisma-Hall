import { expect, test } from "vitest";
import { ticketIncomeSchema } from "@/lib/validations/admin/analytics-management/ticketIncomeSchema";

/* - Funções e dados auxiliares - */

type TicketIncomeInput = Parameters<typeof ticketIncomeSchema.safeParse>[0];

const buildInput = (overrides: Record<string, unknown> = {}): TicketIncomeInput => ({
  label: "this month",
  tag: "rock",
  ...overrides,
});

// Devolve o campo e a mensagem de cada erro, para cada teste conferir só o que importa

const getIssues = (input: unknown) => {
  const result = ticketIncomeSchema.safeParse(input);

  return result.success ? [] : result.error.issues.map((issue) => ({ field: issue.path[0], message: issue.message }));
};

const getInvalidFields = (input: unknown) => getIssues(input).map((issue) => issue.field);

/* - Testando o período - */

test.each([
  ["today"],
  ["this week"],
  ["this month"],
  ["two-month period"],
  ["three-month period"],
  ["four-month period"],
  ["six-month period"],
  ["this year"],
  ["all periods"],
])("should accept the period %s", (label) => {
  const result = ticketIncomeSchema.safeParse(buildInput({ label }));

  expect(result.success).toBe(true);
});

test.each([
  ["an empty string", ""],
  ["a period that does not exist", "last month"],
  ["a period with uppercase letters", "Today"],
  ["a period with hyphens instead of spaces", "this-week"],
  ["a number", 1],
  ["null", null],
  ["undefined", undefined],
])("should refuse the input when the period is %s", (_description, label) => {
  expect(getInvalidFields(buildInput({ label }))).toEqual(["label"]);
});

/* - Testando a tag do evento - */

test.each([["trap_and_hiphop"], ["forro"], ["samba_and_pagode"], ["metal"], ["eletronica"], ["funk"], ["rock"], ["pop"]])(
  "should accept the tag %s",
  (tag) => {
    const result = ticketIncomeSchema.safeParse(buildInput({ tag }));

    expect(result.success).toBe(true);
  },
);

test.each([
  ["an empty string", ""],
  ["a tag that does not exist", "jazz"],
  ["a tag with uppercase letters", "ROCK"],
  ["the label of the tag instead of its value", "Trap & HipHop"],
  ["the all tags value, which is not accepted in the ticket income", "all_tags"],
  ["a number", 1],
  ["null", null],
  ["undefined", undefined],
])("should refuse the input when the tag is %s", (_description, tag) => {
  expect(getInvalidFields(buildInput({ tag }))).toEqual(["tag"]);
});

/* - Testando o nome do evento - */

test("should accept the input without the event name", () => {
  const result = ticketIncomeSchema.safeParse(buildInput());

  expect(result.success).toBe(true);
});

test("should accept the input when the event name is undefined", () => {
  const result = ticketIncomeSchema.safeParse(buildInput({ name: undefined }));

  expect(result.success).toBe(true);
});

test.each([
  ["one character", "a"],
  ["a regular name", "Rock na Praça"],
  ["a name with accents and symbols", "Festa Junina: Forró & Samba!"],
  ["exactly 30 characters", "a".repeat(30)],
])("should accept an event name with %s", (_description, name) => {
  const result = ticketIncomeSchema.safeParse(buildInput({ name }));

  expect(result.success).toBe(true);
});

test("should refuse an empty event name with the message asking for the name", () => {
  expect(getIssues(buildInput({ name: "" }))).toEqual([{ field: "name", message: "Digite o nome do evento." }]);
});

test.each([
  ["31 characters", "a".repeat(31)],
  ["a very long name", "a".repeat(200)],
])("should refuse an event name with %s with the message saying that it is too long", (_description, name) => {
  expect(getIssues(buildInput({ name }))).toEqual([{ field: "name", message: "O nome do evento está muito longo." }]);
});

test.each([
  ["null", null],
  ["a number", 1],
  ["an array", ["Rock na Praça"]],
  ["an object", { title: "Rock na Praça" }],
])("should refuse the input when the event name is %s", (_description, name) => {
  expect(getInvalidFields(buildInput({ name }))).toEqual(["name"]);
});

/* - Testando os campos obrigatórios - */

test("should refuse the input when the period is missing", () => {
  expect(getInvalidFields({ tag: "rock" })).toEqual(["label"]);
});

test("should refuse the input when the tag is missing", () => {
  expect(getInvalidFields({ label: "this month" })).toEqual(["tag"]);
});

test("should refuse the input and point at every invalid field", () => {
  expect(getInvalidFields({ label: "last month", tag: "jazz", name: "" })).toEqual(["label", "tag", "name"]);
});

test.each([
  ["an empty object", {}],
  ["null", null],
  ["undefined", undefined],
  ["a string", "this month"],
  ["an array", []],
])("should refuse the input when it is %s", (_description, input) => {
  const result = ticketIncomeSchema.safeParse(input);

  expect(result.success).toBe(false);
});

/* - Testando o resultado - */

test("should return the period and the tag that came in when there is no event name", () => {
  const result = ticketIncomeSchema.safeParse(buildInput({ label: "this year", tag: "pop" }));

  expect(result.success).toBe(true);
  expect(result.data).toEqual({ label: "this year", tag: "pop" });
});

test("should return the period, the tag and the event name that came in", () => {
  const result = ticketIncomeSchema.safeParse(buildInput({ label: "today", tag: "funk", name: "Baile Funk" }));

  expect(result.success).toBe(true);
  expect(result.data).toEqual({ label: "today", tag: "funk", name: "Baile Funk" });
});

test("should remove the fields that are not in the schema", () => {
  const result = ticketIncomeSchema.safeParse(buildInput({ userId: "user 1", extra: true }));

  expect(result.success).toBe(true);
  expect(result.data).toEqual({ label: "this month", tag: "rock" });
});
