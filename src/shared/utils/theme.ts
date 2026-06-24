export type Theme = "Dark" | "Light";

/* - Buscando o Tema - */

const getTheme = () => {
  return (localStorage.getItem("Theme") as Theme) ?? "Light";
};

/* - Salvando o Tema - */

const saveTheme = (Theme: Theme) => {
  localStorage.setItem("Theme", Theme);
};

/* - Usando o Tema - */

const applyTheme = (Theme: Theme) => {
  document.documentElement.classList.toggle("dark", Theme === "Dark");
};

export { getTheme, saveTheme, applyTheme };
