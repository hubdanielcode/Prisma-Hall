import { expect, test } from "vitest";
import { formatCurrency, formatPeople } from "@/shared/utils/functions/formatters";

/* - Funções e dados auxiliares - */

// O toLocaleString do pt-BR separa o "R$" do valor com um espaço que não quebra (\u00a0), e não com um espaço comum

const nbsp = "\u00a0";

/* - Testando a formatação em reais - */

test.each([
  ["zero", 0, `R$${nbsp}0,00`],
  ["an integer value", 50, `R$${nbsp}50,00`],
  ["a value with one decimal place, filling it with zero", 12.5, `R$${nbsp}12,50`],
  ["a value with two decimal places", 99.99, `R$${nbsp}99,99`],
  ["a value with thousands, using a dot as the separator", 1234.5, `R$${nbsp}1.234,50`],
  ["a value with millions", 1234567.89, `R$${nbsp}1.234.567,89`],
  ["a value of cents", 0.5, `R$${nbsp}0,50`],
])("should format %s", (_description, value, expected) => {
  expect(formatCurrency(value)).toBe(expected);
});

test.each([
  ["down", 10.994, `R$${nbsp}10,99`],
  ["up", 10.996, `R$${nbsp}11,00`],
])("should round to two decimal places %s", (_description, value, expected) => {
  expect(formatCurrency(value)).toBe(expected);
});

test("should format a negative value with the minus sign before the currency", () => {
  expect(formatCurrency(-10)).toBe(`-R$${nbsp}10,00`);
});

test("should use a non-breaking space between the currency and the value", () => {
  expect(formatCurrency(50)).toContain(nbsp);
  expect(formatCurrency(50)).not.toContain(" ");
});

/* - Testando a formatação da quantidade de pessoas - */

test("should use the singular when there is one person", () => {
  expect(formatPeople(1)).toBe("1 pessoa");
});

test.each([
  ["zero", 0],
  ["two", 2],
  ["many", 100],
  ["a negative number", -1],
  ["a number with decimals", 1.5],
])("should use the plural when the quantity is %s", (_description, value) => {
  expect(formatPeople(value)).toBe(`${value} pessoas`);
});
