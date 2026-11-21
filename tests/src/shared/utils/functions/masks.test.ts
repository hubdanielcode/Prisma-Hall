import { expect, test } from "vitest";
import { masks } from "@/shared/utils/functions/masks";

/* - Funções e dados auxiliares - */

// Máscaras que só mudam o limite de caracteres: título e descrição do evento, nome e descrição do produto

const textMasks = [
  ["productName", masks.productName, 50],
  ["productDescription", masks.productDescription, 150],
  ["eventTitle", masks.eventTitle, 150],
  ["eventDescription", masks.eventDescription, 150],
] as const;

// Máscaras de preço idênticas: o preço do produto e o do evento

const priceMasks = [
  ["productPrice", masks.productPrice],
  ["eventPrice", masks.eventPrice],
] as const;

// Máscaras que traduzem um valor do banco para o texto da tela

const labelMasks = [
  ["productCategory", masks.productCategory],
  ["productStatus", masks.productStatus],
  ["paymentStatus", masks.paymentStatus],
  ["paymentMethod", masks.paymentMethod],
  ["orderStatus", masks.orderStatus],
  ["pickupStatus", masks.pickupStatus],
  ["eventTag", masks.eventTag],
  ["eventStatus", masks.eventStatus],
] as const;

/* - Testando a máscara do nome - */

test.each([
  ["lowercase", "maria silva", "Maria Silva"],
  ["uppercase", "MARIA SILVA", "Maria Silva"],
  ["mixed case", "mArIa sIlVa", "Maria Silva"],
  ["a single word", "maria", "Maria"],
  ["an empty string", "", ""],
])("should capitalize each word of a name typed in %s", (_description, value, expected) => {
  expect(masks.name(value)).toBe(expected);
});

test.each([
  ["da", "maria da silva", "Maria da Silva"],
  ["de", "joão de souza", "João de Souza"],
  ["do", "ana do carmo", "Ana do Carmo"],
  ["das", "maria das dores", "Maria das Dores"],
  ["dos", "pedro dos santos", "Pedro dos Santos"],
  ["e", "joão e maria", "João e Maria"],
  ["an exception typed in uppercase", "MARIA DA SILVA", "Maria da Silva"],
])("should keep the connector word in lowercase: %s", (_description, value, expected) => {
  expect(masks.name(value)).toBe(expected);
});

test.each([
  ["a name with an accent in the middle", "joão da silva", "João da Silva"],
  ["a name with an accent at the end", "andré luiz", "André Luiz"],
  ["an uppercase name with an accent in the middle", "MARIA DE FÁTIMA", "Maria de Fátima"],
  ["a hyphenated name", "ana-maria", "Ana-Maria"],
  ["a name with an apostrophe", "o'connor", "O'Connor"],
])("should format %s", (_description, value, expected) => {
  expect(masks.name(value)).toBe(expected);
});

// Palavras que começam ou terminam com letra acentuada: o \b da regex só enxerga letras sem acento, então a palavra é cortada na letra acentuada

test.each([
  ["an uppercase name that ends with an accent", "JOSÉ", "José"],
  ["an uppercase name that ends with an accent after another word", "MARIA RENÉ", "Maria René"],
  ["a lowercase name that starts with an accent", "érica", "Érica"],
  ["a name already capitalized that starts with an accent", "Érica", "Érica"],
  ["an uppercase name that starts with an accent", "ÂNGELA SOUZA", "Ângela Souza"],
])("should format %s", (_description, value, expected) => {
  expect(masks.name(value)).toBe(expected);
});

test.each([
  ["digits", "maria123", "Maria"],
  ["symbols", "ma!r@ia#", "Maria"],
  ["an underscore", "maria_silva", "Mariasilva"],
])("should remove %s from the name", (_description, value, expected) => {
  expect(masks.name(value)).toBe(expected);
});

test("should collapse repeated spaces in the name into one", () => {
  expect(masks.name("maria     silva")).toBe("Maria Silva");
});

test("should limit the name to 50 characters", () => {
  expect(masks.name("a".repeat(60))).toBe(`A${"a".repeat(49)}`);
});

/* - Testando a máscara do e-mail - */

test.each([
  ["uppercase letters", "MARIA@Gmail.COM", "maria@gmail.com"],
  ["spaces", "maria silva@gmail.com", "mariasilva@gmail.com"],
  ["symbols that are not allowed", "ma!r#ia$@gmail.com", "maria@gmail.com"],
  ["accents", "josé@gmail.com", "jos@gmail.com"],
  ["repeated at signs", "maria@@gmail.com", "maria@gmail.com"],
  ["repeated dots", "maria..silva@gmail.com", "maria.silva@gmail.com"],
])("should fix the email that has %s", (_description, value, expected) => {
  expect(masks.email(value)).toBe(expected);
});

test.each([
  ["a plus sign", "maria+tag@gmail.com"],
  ["an underscore", "maria_silva@gmail.com"],
  ["a hyphen", "maria-silva@gmail.com"],
  ["a percent sign", "maria%silva@gmail.com"],
  ["digits", "maria123@gmail.com"],
])("should keep the email that has %s", (_description, value) => {
  expect(masks.email(value)).toBe(value);
});

test("should limit the email to 50 characters", () => {
  expect(masks.email("a".repeat(60))).toBe("a".repeat(50));
});

/* - Testando a máscara do telefone - */

test.each([
  ["an empty value", "", ""],
  ["one digit", "1", "1"],
  ["the area code", "11", "11"],
  ["three digits", "119", "(11) 9"],
  ["five digits", "11987", "(11) 987"],
  ["six digits", "119876", "(11) 9876"],
  ["seven digits", "1198765", "(11) 9876-5"],
  ["nine digits", "119876543", "(11) 9876-543"],
  ["ten digits, as a landline", "1198765432", "(11) 9876-5432"],
  ["eleven digits, as a cell phone", "11987654321", "(11) 98765-4321"],
])("should format the phone with %s", (_description, value, expected) => {
  expect(masks.phoneNumber(value)).toBe(expected);
});

test.each([
  ["a cell phone that is already formatted", "(11) 98765-4321", "(11) 98765-4321"],
  ["a landline that is already formatted", "(11) 9876-5432", "(11) 9876-5432"],
  ["letters mixed with the digits", "abc11987654321", "(11) 98765-4321"],
  ["more than eleven digits", "119876543210000", "(11) 98765-4321"],
])("should format the phone with %s", (_description, value, expected) => {
  expect(masks.phoneNumber(value)).toBe(expected);
});

/* - Testando a máscara do CPF - */

test.each([
  ["an empty value", "", ""],
  ["three digits", "123", "123"],
  ["four digits", "1234", "123.4"],
  ["six digits", "123456", "123.456"],
  ["seven digits", "1234567", "123.456.7"],
  ["nine digits", "123456789", "123.456.789"],
  ["ten digits", "1234567890", "123.456.789-0"],
  ["eleven digits", "12345678901", "123.456.789-01"],
  ["a value that is already formatted", "123.456.789-01", "123.456.789-01"],
  ["more than eleven digits", "123456789012", "123.456.789-01"],
  ["letters only", "abc", ""],
])("should format the social security number with %s", (_description, value, expected) => {
  expect(masks.socialSecurityNumber(value)).toBe(expected);
});

/* - Testando a máscara da data de nascimento - */

test.each([
  ["an empty value", "", ""],
  ["one digit", "0", "0"],
  ["the day", "05", "05"],
  ["three digits", "050", "05/0"],
  ["the day and the month", "0501", "05/01"],
  ["five digits", "05011", "05/01/1"],
  ["a full date", "05011990", "05/01/1990"],
  ["a value that is already formatted", "05/01/1990", "05/01/1990"],
  ["more than eight digits", "050119901234", "05/01/1990"],
  ["letters only", "ab", ""],
])("should format the birth date with %s", (_description, value, expected) => {
  expect(masks.birthDate(value)).toBe(expected);
});

/* - Testando a máscara do CEP - */

test.each([
  ["an empty value", "", ""],
  ["five digits", "12345", "12345"],
  ["six digits", "123456", "12345-6"],
  ["a full zip code", "12345678", "12345-678"],
  ["a value that is already formatted", "12345-678", "12345-678"],
  ["more than eight digits", "123456789", "12345-678"],
  ["letters only", "abc", ""],
])("should format the zip code with %s", (_description, value, expected) => {
  expect(masks.zipCode(value)).toBe(expected);
});

/* - Testando as máscaras do endereço - */

test.each([
  ["an accented city", "são paulo", "são paulo"],
  ["a city with an apostrophe", "santa bárbara d'oeste", "santa bárbara d'oeste"],
  ["a city with a hyphen", "embu-guaçu", "embu-guaçu"],
  ["a city with digits and symbols", "rio123!@#", "rio"],
])("should format the city when it has %s", (_description, value, expected) => {
  expect(masks.city(value)).toBe(expected);
});

test("should limit the city to 50 characters", () => {
  expect(masks.city("a".repeat(60))).toBe("a".repeat(50));
});

test.each([
  ["lowercase letters", "sp", "SP"],
  ["uppercase letters", "SP", "SP"],
  ["more than two letters", "spx", "SP"],
  ["digits between the letters", "s1p", "SP"],
  ["one letter", "s", "S"],
  ["an empty value", "", ""],
])("should format the state when it has %s", (_description, value, expected) => {
  expect(masks.state(value)).toBe(expected);
});

test.each([
  ["digits", "centro 2", "centro 2"],
  ["an apostrophe and a hyphen", "jardim d'ajuda-sul", "jardim d'ajuda-sul"],
  ["accents", "são joão", "são joão"],
  ["symbols that are not allowed", "centro@#!", "centro"],
  ["a dot and a comma, which are not allowed", "av. brasil, 10", "av brasil 10"],
])("should format the neighborhood when it has %s", (_description, value, expected) => {
  expect(masks.neighborhood(value)).toBe(expected);
});

test("should limit the neighborhood to 60 characters", () => {
  expect(masks.neighborhood("a".repeat(70))).toBe("a".repeat(60));
});

test.each([
  ["a dot and a comma", "av. brasil, 10", "av. brasil, 10"],
  ["accents", "rua são joão", "rua são joão"],
  ["an apostrophe and a hyphen", "rua d'ajuda-sul", "rua d'ajuda-sul"],
  ["symbols that are not allowed", "rua das flores@#!", "rua das flores"],
])("should format the street when it has %s", (_description, value, expected) => {
  expect(masks.street(value)).toBe(expected);
});

test("should limit the street to 50 characters", () => {
  expect(masks.street("a".repeat(60))).toBe("a".repeat(50));
});

test.each([
  ["digits", "123", "123"],
  ["letters and symbols", "a1b2-3", "123"],
  ["an empty value", "", ""],
])("should keep only the digits of the address number when it has %s", (_description, value, expected) => {
  expect(masks.number(value)).toBe(expected);
});

test("should limit the address number to 7 digits", () => {
  expect(masks.number("123456789")).toBe("1234567");
});

test.each([
  ["a dot and a comma", "apto 101, bloco b.", "apto 101, bloco b."],
  ["symbols that are not allowed", "apto@ 101#", "apto 101"],
])("should format the complement when it has %s", (_description, value, expected) => {
  expect(masks.complement(value)).toBe(expected);
});

test("should limit the complement to 25 characters", () => {
  expect(masks.complement("a".repeat(30))).toBe("a".repeat(25));
});

/* - Testando as máscaras de texto do produto e do evento - */

test.each(textMasks)("should capitalize the first letter in %s without changing the rest", (_name, mask) => {
  expect(mask("cerveja pilsen")).toBe("Cerveja pilsen");
  expect(mask("CERVEJA PILSEN")).toBe("CERVEJA PILSEN");
});

test.each(textMasks)("should capitalize the first letter after a sentence end in %s", (_name, mask) => {
  expect(mask("cerveja gelada. venha! quer? sim")).toBe("Cerveja gelada. Venha! Quer? Sim");
});

test.each(textMasks)("should remove the emojis in %s", (_name, mask) => {
  expect(mask("Cerveja 🍺 gelada")).toBe("Cerveja gelada");
});

test.each(textMasks)("should collapse repeated spaces in %s", (_name, mask) => {
  expect(mask("cerveja     gelada")).toBe("Cerveja gelada");
});

test.each(textMasks)("should keep digits, symbols and accents in %s", (_name, mask) => {
  expect(mask("Chopp 500ml - promoção (2x1)")).toBe("Chopp 500ml - promoção (2x1)");
});

test.each(textMasks)("should return an empty string for an empty value in %s", (_name, mask) => {
  expect(mask("")).toBe("");
});

test.each(textMasks)("should limit the text to its maximum length in %s", (_name, mask, limit) => {
  expect(mask("a".repeat(limit + 10))).toBe(`A${"a".repeat(limit - 1)}`);
});

/* - Testando a máscara da quantidade do produto - */

test.each([
  ["digits", "12", "12"],
  ["letters and symbols", "a1-2b", "12"],
  ["an empty value", "", ""],
  ["more than four digits", "12345", "1234"],
])("should keep only the digits of the quantity when it has %s", (_description, value, expected) => {
  expect(masks.productQuantity(value)).toBe(expected);
});

/* - Testando as máscaras de preço - */

test.each(priceMasks)("should keep the value without a decimal part up to four digits in %s", (_name, mask) => {
  expect(mask("")).toBe("");
  expect(mask("5")).toBe("5");
  expect(mask("50")).toBe("50");
  expect(mask("1234")).toBe("1234");
});

test.each(priceMasks)("should move the extra digits to the decimal part after the fourth digit in %s", (_name, mask) => {
  expect(mask("12345")).toBe("1234,5");
  expect(mask("123456")).toBe("1234,56");
  expect(mask("1234567")).toBe("1234,56");
});

test.each(priceMasks)("should keep the decimal part up to two digits in %s", (_name, mask) => {
  expect(mask("10,5")).toBe("10,5");
  expect(mask("10,50")).toBe("10,50");
  expect(mask("10,555")).toBe("10,55");
  expect(mask("12345,67")).toBe("1234,67");
});

test.each(priceMasks)("should turn the dot into a comma in %s", (_name, mask) => {
  expect(mask("10.5")).toBe("10,5");
  expect(mask("10.50")).toBe("10,50");
});

test.each(priceMasks)("should keep the comma while the person has not typed the decimal part in %s", (_name, mask) => {
  expect(mask("12,")).toBe("12,");
  expect(mask(",5")).toBe(",5");
});

test.each(priceMasks)("should remove the characters that are not digits or a comma in %s", (_name, mask) => {
  expect(mask("abc")).toBe("");
  expect(mask("1a2b")).toBe("12");
  expect(mask("R$ 10")).toBe("10");
  expect(mask("-10")).toBe("10");
});

test.each(priceMasks)("should join the digits after the first comma into a single decimal part in %s", (_name, mask) => {
  expect(mask("1,2,3")).toBe("1,23");
});

/* - Testando as máscaras que traduzem valores do banco - */

test.each([
  ["beers", "Cervejas"],
  ["cocktails", "Coquetéis"],
  ["drinks", "Drinks"],
  ["no_alcohol", "Sem Álcool"],
] as const)("should translate the product category %s", (value, expected) => {
  expect(masks.productCategory(value)).toBe(expected);
});

test.each([
  ["active", "Ativo"],
  ["inactive", "Inativo"],
] as const)("should translate the product status %s", (value, expected) => {
  expect(masks.productStatus(value)).toBe(expected);
});

test.each([
  ["confirmed", "Pago"],
  ["pending", "Pagamento pendente"],
  ["failed", "Pagamento falhou"],
  ["refunded", "Reembolsado"],
] as const)("should translate the payment status %s", (value, expected) => {
  expect(masks.paymentStatus(value)).toBe(expected);
});

test.each([
  ["cash", "Dinheiro"],
  ["pix", "Pix"],
  ["creditCard", "Cartão de crédito"],
  ["debitCard", "Cartão de débito"],
] as const)("should translate the payment method %s", (value, expected) => {
  expect(masks.paymentMethod(value)).toBe(expected);
});

test.each([
  ["confirmed", "Pedido confirmado"],
  ["pending", "Pedido pendente"],
  ["cancelled", "Pedido cancelado"],
] as const)("should translate the order status %s", (value, expected) => {
  expect(masks.orderStatus(value)).toBe(expected);
});

test.each([
  ["pickedUp", "Retirado"],
  ["notPickedUp", "Não retirado"],
] as const)("should translate the pickup status %s", (value, expected) => {
  expect(masks.pickupStatus(value)).toBe(expected);
});

test.each([
  ["trap_and_hiphop", "Trap & HipHop"],
  ["forro", "Forró"],
  ["samba_and_pagode", "Samba & Pagode"],
  ["metal", "Metal"],
  ["eletronica", "Eletrônica"],
  ["funk", "Funk"],
  ["rock", "Rock"],
  ["pop", "Pop"],
] as const)("should translate the event tag %s", (value, expected) => {
  expect(masks.eventTag(value)).toBe(expected);
});

test.each([
  ["soon", "Em Breve"],
  ["happened", "Encerrado"],
  ["cancelled", "Cancelado"],
] as const)("should translate the event status %s", (value, expected) => {
  expect(masks.eventStatus(value)).toBe(expected);
});

test.each(labelMasks)("should return undefined in %s when the value is not known", (_name, mask) => {
  expect((mask as (value: string) => unknown)("unknown")).toBeUndefined();
});

/* - Testando a máscara do horário do evento - */

test.each([
  ["an empty value", "", ""],
  ["one digit", "1", "1"],
  ["the hour", "19", "19"],
  ["three digits", "193", "19:3"],
  ["the hour and the minutes", "1930", "19:30"],
  ["a value that is already formatted", "19:30", "19:30"],
  ["more than four digits", "19301", "19:30"],
  ["letters mixed with the digits", "ab12", "12"],
])("should format the event time with %s", (_description, value, expected) => {
  expect(masks.eventTime(value)).toBe(expected);
});
