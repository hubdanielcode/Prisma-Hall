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
        /* - Bcrypt - */

        {
          find: "bcrypt",
          replacement: path.resolve(dirname, "./mocks/bcrypt.ts"),
        },

        /* - Prisma - */

        {
          find: "@/lib/prisma",
          replacement: path.resolve(dirname, "./mocks/prisma.ts"),
        },

        /* - Hooks - */

        // 1. Analytics

        {
          find: "@/features/admin/analytics-management/hooks/useNewVisitors",
          replacement: path.resolve(dirname, "./mocks/hooks/analytics/useNewVisitors.ts"),
        },

        {
          find: "@/features/admin/analytics-management/hooks/useTicketIncome",
          replacement: path.resolve(dirname, "./mocks/hooks/analytics/useTicketIncome.ts"),
        },

        {
          find: "@/features/admin/analytics-management/hooks/useVoucherIncome",
          replacement: path.resolve(dirname, "./mocks/hooks/analytics/useVoucherIncome.ts"),
        },

        // 2. Bar

        {
          find: "@/features/bar/hooks/useProducts",
          replacement: path.resolve(dirname, "./mocks/hooks/bar/useProducts.ts"),
        },

        // 3. Cart

        {
          find: "@/features/cart/hooks/useCartItems",
          replacement: path.resolve(dirname, "./mocks/hooks/cart/useCartItems.ts"),
        },

        {
          find: "@/features/cart/hooks/usePayNow",
          replacement: path.resolve(dirname, "./mocks/hooks/cart/usePayNow.ts"),
        },

        // 4. Events

        {
          find: "@/features/events/event/hooks/useAttractions",
          replacement: path.resolve(dirname, "./mocks/hooks/events/useAttractions.ts"),
        },

        {
          find: "@/features/events/event/hooks/useEvents",
          replacement: path.resolve(dirname, "./mocks/hooks/events/useEvents.ts"),
        },

        {
          find: "@/features/events/gallery/hooks/useGallery",
          replacement: path.resolve(dirname, "./mocks/hooks/events/useGallery.ts"),
        },

        {
          find: "@/features/events/reviews/hooks/useReviews",
          replacement: path.resolve(dirname, "./mocks/hooks/events/useReviews.ts"),
        },

        // 5. Newsletter

        {
          find: "@/features/newsletter/hooks/useNewsletter",
          replacement: path.resolve(dirname, "./mocks/hooks/newsletter/useNewsletter.ts"),
        },

        // 6. Users

        {
          find: "@/features/users/notifications/hooks/useNotificationPreferences",
          replacement: path.resolve(dirname, "./mocks/hooks/users/useNotificationPreferences.ts"),
        },

        {
          find: "@/features/users/notifications/hooks/useNotifications",
          replacement: path.resolve(dirname, "./mocks/hooks/users/useNotifications.ts"),
        },

        {
          find: "@/features/users/profile/hooks/useProfiles",
          replacement: path.resolve(dirname, "find./mock/hooks/users/useProfiles.ts"),
        },

        {
          find: "@/features/users/tickets/hooks/useTicketOrder",
          replacement: path.resolve(dirname, "./mocks/hooks/users/useTicketOrder.ts"),
        },

        {
          find: "@/features/users/tickets/hooks/useTickets",
          replacement: path.resolve(dirname, "./mocks/hooks/users/useTickets.ts"),
        },

        {
          find: "@/features/users/user/hooks/useUsers",
          replacement: path.resolve(dirname, "./mocks/hooks/users/useUsers.ts"),
        },

        {
          find: "@/features/users/vouchers/hooks/useVoucherOrder",
          replacement: path.resolve(dirname, "./mocks/hooks/users/useVoucherOrder.ts"),
        },

        {
          find: "@/features/users/vouchers/hooks/useVouchers",
          replacement: path.resolve(dirname, "./mocks/hooks/users/useVouchers.ts"),
        },

        // 4. Aliases originais

        ...normalizedAlias,
      ],
    };

    return viteConfig;
  },
};

export default config;
