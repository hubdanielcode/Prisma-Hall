import { expect, test } from "vitest";
import { atLeastOneFieldUpdated } from "@/shared/utils/functions/atLeastOneFieldUpdated";

/* - Testando os objetos com algum campo atualizado - */

test("should return true when the only field has a value", () => {
  expect(atLeastOneFieldUpdated({ title: "Rock na Praça" })).toBe(true);
});

test("should return true when only one of many fields has a value", () => {
  expect(atLeastOneFieldUpdated({ title: undefined, description: "Nova descrição", price: undefined })).toBe(true);
});

test("should return true when every field has a value", () => {
  expect(atLeastOneFieldUpdated({ title: "Rock na Praça", price: 50 })).toBe(true);
});

// Só o undefined conta como campo não atualizado: os outros valores "vazios" são valores válidos para gravar

test.each([
  ["an empty string", ""],
  ["zero", 0],
  ["false", false],
  ["null", null],
  ["NaN", NaN],
  ["an empty array", []],
  ["an empty object", {}],
])("should return true when the field is %s", (_description, value) => {
  expect(atLeastOneFieldUpdated({ field: value })).toBe(true);
});

test("should return true when the field is a date", () => {
  expect(atLeastOneFieldUpdated({ startsAt: new Date("2099-01-01T20:00:00.000Z") })).toBe(true);
});

/* - Testando os objetos sem nenhum campo atualizado - */

test("should return false when the object has no fields", () => {
  expect(atLeastOneFieldUpdated({})).toBe(false);
});

test("should return false when the only field is undefined", () => {
  expect(atLeastOneFieldUpdated({ title: undefined })).toBe(false);
});

test("should return false when every field is undefined", () => {
  expect(atLeastOneFieldUpdated({ title: undefined, description: undefined, price: undefined })).toBe(false);
});

/* - Testando o formato do retorno - */

test.each([
  ["an object with a field updated", { title: "Rock na Praça" }, true],
  ["an object with no field updated", { title: undefined }, false],
])("should return a boolean for %s", (_description, input, expected) => {
  expect(atLeastOneFieldUpdated(input)).toBe(expected);
});

test("should not change the object it receives", () => {
  const input = { title: "Rock na Praça", price: undefined };

  atLeastOneFieldUpdated(input);

  expect(input).toEqual({ title: "Rock na Praça", price: undefined });
  expect(Object.keys(input)).toEqual(["title", "price"]);
});
