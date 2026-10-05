import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "node:path";

const dirname = import.meta.dirname;

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@chromatic-com/storybook", "@storybook/addon-vitest", "@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-mcp"],
  framework: "@storybook/nextjs-vite",

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
        // 1. Bcrypt

        { find: "bcrypt", replacement: path.resolve(dirname, "./mocks/bcrypt.ts") },

        // 2. Prisma

        { find: "@/lib/prisma", replacement: path.resolve(dirname, "./mocks/prisma.ts") },

        // 3. Hooks

        { find: "@/features/bar/hooks/useProducts", replacement: path.resolve(dirname, "./mocks/hooks/bar/useProducts.ts") },

        { find: "@/features/events/event/hooks/useEvents", replacement: path.resolve(dirname, "./mocks/hooks/events/event/useEvents.ts") },
        { find: "@/features/events/event/hooks/useAttracions", replacement: path.resolve(dirname, "./mocks/hooks/events/event/useAttracions.ts") },

        { find: "@/features/users/profile/hooks/useProfiles", replacement: path.resolve(dirname, "find./mock/hooks/users/profiles/useProfiles.ts") },
        { find: "@/features/users/tickets/hooks/useTickets", replacement: path.resolve(dirname, "./mocks/hooks/users/tickets/useTickets.ts") },
        { find: "@/features/users/user/hooks/useUsers", replacement: path.resolve(dirname, "./mocks/hooks/users/user/useUsers.ts") },
        { find: "@/features/users/vouchers/hooks/useVouchers", replacement: path.resolve(dirname, "./mocks/hooks/users/vouchers/useVouchers.ts") },

        // 4. Aliases originais

        ...normalizedAlias,
      ],
    };

    return viteConfig;
  },
};

export default config;
