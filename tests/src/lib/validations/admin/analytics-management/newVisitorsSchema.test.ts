import { expect, test } from "vitest";
import { newVisitorsSchema } from "@/lib/validations/admin/analytics-management/newVisitorsSchema";

/* - Funções e dados auxiliares - */

type NewVisitorsInput = Parameters<typeof newVisitorsSchema.safeParse>[0];

const buildInput = (overrides: Record<string, unknown> = {}): NewVisitorsInput => ({
  label: "this month",
  tag: "all_tags",
  ...overrides,
});

// Devolve os caminhos dos campos que o schema recusou, para cada teste conferir só o que importa

const getInvalidFields = (input: unknown) => {
  const result = newVisitorsSchema.safeParse(input);

  return result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
};

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
  const result = newVisitorsSchema.safeParse(buildInput({ label }));

  expect(result.success).toBe(true);
});

test.each([
  ["an empty string", ""],
  ["a period that does not exist", "last month"],
  ["a period with uppercase letters", "Today"],
  ["a period with extra spaces", " today "],
  ["a period with hyphens instead of spaces", "this-week"],
  ["a number", 1],
  ["null", null],
  ["undefined", undefined],
  ["an array", ["today"]],
])("should refuse the input when the period is %s", (_description, label) => {
  const result = newVisitorsSchema.safeParse(buildInput({ label }));

  expect(result.success).toBe(false);
  expect(getInvalidFields(buildInput({ label }))).toEqual(["label"]);
});

/* - Testando a tag do evento - */

test.each([["trap_and_hiphop"], ["forro"], ["samba_and_pagode"], ["metal"], ["eletronica"], ["funk"], ["rock"], ["pop"], ["all_tags"]])(
  "should accept the tag %s",
  (tag) => {
    const result = newVisitorsSchema.safeParse(buildInput({ tag }));

    expect(result.success).toBe(true);
  },
);

test.each([
  ["an empty string", ""],
  ["a tag that does not exist", "jazz"],
  ["a tag with uppercase letters", "ROCK"],
  ["the all tags value with uppercase letters", "ALL_TAGS"],
  ["the label of the tag instead of its value", "Trap & HipHop"],
  ["a number", 1],
  ["null", null],
  ["undefined", undefined],
  ["an array", ["rock"]],
])("should refuse the input when the tag is %s", (_description, tag) => {
  const result = newVisitorsSchema.safeParse(buildInput({ tag }));

  expect(result.success).toBe(false);
  expect(getInvalidFields(buildInput({ tag }))).toEqual(["tag"]);
});

/* - Testando os campos obrigatórios - */

test("should refuse the input when the period is missing", () => {
  expect(getInvalidFields({ tag: "all_tags" })).toEqual(["label"]);
});

test("should refuse the input when the tag is missing", () => {
  expect(getInvalidFields({ label: "this month" })).toEqual(["tag"]);
});

test("should refuse the input and point at both fields when the period and the tag are invalid", () => {
  expect(getInvalidFields({ label: "last month", tag: "jazz" })).toEqual(["label", "tag"]);
});

test.each([
  ["an empty object", {}],
  ["null", null],
  ["undefined", undefined],
  ["a string", "this month"],
  ["an array", []],
])("should refuse the input when it is %s", (_description, input) => {
  const result = newVisitorsSchema.safeParse(input);

  expect(result.success).toBe(false);
});

/* - Testando o resultado - */

test("should return the same period and tag that came in", () => {
  const result = newVisitorsSchema.safeParse(buildInput({ label: "this year", tag: "rock" }));

  expect(result.success).toBe(true);
  expect(result.data).toEqual({ label: "this year", tag: "rock" });
});

test("should remove the fields that are not in the schema", () => {
  const result = newVisitorsSchema.safeParse(buildInput({ userId: "user 1", extra: true }));

  expect(result.success).toBe(true);
  expect(result.data).toEqual({ label: "this month", tag: "all_tags" });
});
