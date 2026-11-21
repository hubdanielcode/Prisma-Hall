import { afterEach, beforeEach, expect, test } from "vitest";
import { applyTheme, getTheme, saveTheme } from "@/shared/utils/functions/theme";

/* - Funções e dados auxiliares - */

// O jsdom já traz o localStorage e o document, então os testes usam os reais e só limpam o estado entre um teste e outro

const resetBrowserState = () => {
  localStorage.clear();
  document.documentElement.className = "";
};

beforeEach(() => {
  resetBrowserState();
});

afterEach(() => {
  resetBrowserState();
});

/* - Testando a busca do tema - */

test("should return Light when there is no theme saved", () => {
  expect(getTheme()).toBe("Light");
});

test.each([["Dark"], ["Light"]] as const)("should return the %s theme that was saved", (theme) => {
  localStorage.setItem("Theme", theme);

  expect(getTheme()).toBe(theme);
});

test("should read the theme from the Theme key, which is case sensitive", () => {
  localStorage.setItem("theme", "Dark");

  expect(getTheme()).toBe("Light");
});

/* - Testando o salvamento do tema - */

test.each([["Dark"], ["Light"]] as const)("should save the %s theme in the Theme key", (theme) => {
  saveTheme(theme);

  expect(localStorage.getItem("Theme")).toBe(theme);
});

test("should replace the theme that was already saved", () => {
  saveTheme("Dark");
  saveTheme("Light");

  expect(localStorage.getItem("Theme")).toBe("Light");
  expect(localStorage.length).toBe(1);
});

test.each([["Dark"], ["Light"]] as const)("should return the %s theme right after saving it", (theme) => {
  saveTheme(theme);

  expect(getTheme()).toBe(theme);
});

test("should not change the page when saving the theme", () => {
  saveTheme("Dark");

  expect(document.documentElement.classList.contains("dark")).toBe(false);
});

/* - Testando a aplicação do tema - */

test("should add the dark class to the page when the theme is Dark", () => {
  applyTheme("Dark");

  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("should remove the dark class from the page when the theme is Light", () => {
  document.documentElement.classList.add("dark");

  applyTheme("Light");

  expect(document.documentElement.classList.contains("dark")).toBe(false);
});

test("should not add the dark class when the theme is Light", () => {
  applyTheme("Light");

  expect(document.documentElement.classList.contains("dark")).toBe(false);
});

test("should keep a single dark class when the Dark theme is applied twice", () => {
  applyTheme("Dark");
  applyTheme("Dark");

  expect(document.documentElement.className).toBe("dark");
});

test("should switch the class when the theme changes from Dark to Light and back", () => {
  applyTheme("Dark");
  expect(document.documentElement.classList.contains("dark")).toBe(true);

  applyTheme("Light");
  expect(document.documentElement.classList.contains("dark")).toBe(false);

  applyTheme("Dark");
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("should keep the other classes of the page", () => {
  document.documentElement.classList.add("font-sans");

  applyTheme("Dark");
  expect(document.documentElement.classList.contains("font-sans")).toBe(true);

  applyTheme("Light");
  expect(document.documentElement.classList.contains("font-sans")).toBe(true);
});

test("should not save the theme in the storage when applying it", () => {
  applyTheme("Dark");

  expect(localStorage.getItem("Theme")).toBeNull();
});
