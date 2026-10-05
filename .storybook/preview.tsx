import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

interface StorySortProps {
  importPath: string;
  title: string;
}

const parameters: Preview["parameters"] = {
  nextjs: {
    appDirectory: true,
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
  },
  options: {
    // Essa função é serializada pelo Storybook e roda na sidebar: não pode usar nada declarado fora dela nem criar funções dentro dela

    storySort: (a: StorySortProps, b: StorySortProps) => {
      // 1. Stories do mesmo componente ficam agrupadas por arquivo

      if (a.title === b.title) {
        return a.importPath === b.importPath ? 0 : a.importPath.localeCompare(b.importPath, undefined, { numeric: true });
      }

      const titleSegmentsA = a.title.split("/");
      const titleSegmentsB = b.title.split("/");

      // 2. Descobrindo o primeiro nível em que os títulos se separam

      let level = 0;

      while (level < titleSegmentsA.length && level < titleSegmentsB.length && titleSegmentsA[level] === titleSegmentsB[level]) {
        level++;
      }

      // 3. Peso de cada ramo naquele nível (0 = pasta, 1 = componente, 2 = story solta)

      const weightA = level >= titleSegmentsA.length ? 2 : level < titleSegmentsA.length - 1 ? 0 : 1;
      const weightB = level >= titleSegmentsB.length ? 2 : level < titleSegmentsB.length - 1 ? 0 : 1;

      if (weightA !== weightB) {
        return weightA - weightB;
      }

      // 4. Em caso de empate, ordem alfabética

      return titleSegmentsA[level].localeCompare(titleSegmentsB[level], undefined, { numeric: true });
    },
  },
};

export { parameters };
