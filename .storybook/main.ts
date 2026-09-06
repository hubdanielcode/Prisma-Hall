import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "node:path";

const dirname = import.meta.dirname;

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@chromatic-com/storybook", "@storybook/addon-vitest", "@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-mcp"],
  framework: "@storybook/nextjs-vite",

  // 1. Trocando o @/lib/prisma pelo mock central, só dentro do storybook

  async viteFinal(viteConfig) {
    const existingAlias = viteConfig.resolve?.alias;

    const normalizedAlias = Array.isArray(existingAlias)
      ? existingAlias
      : existingAlias
        ? Object.entries(existingAlias).map(([find, replacement]) => ({ find, replacement }))
        : [];

    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: [
        { find: "@/lib/prisma", replacement: path.resolve(dirname, "./mocks/prisma.ts") },
        { find: "@/features/bar/hooks/useProducts", replace: path.resolve(dirname, "./mocks/useProducts.ts") },
        ...normalizedAlias,
      ],
    };

    return viteConfig;
  },
};

export default config;
