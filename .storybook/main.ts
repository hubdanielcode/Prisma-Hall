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
        /* - Hooks - */

        // 1. Analytics

        {
          find: /^.*\/useNewVisitors$/,
          replacement: path.resolve(dirname, "./mocks/hooks/analytics/useNewVisitors.ts"),
        },

        {
          find: /^.*\/useTicketIncome$/,
          replacement: path.resolve(dirname, "./mocks/hooks/analytics/useTicketIncome.ts"),
        },

        {
          find: /^.*\/useVoucherIncome$/,
          replacement: path.resolve(dirname, "./mocks/hooks/analytics/useVoucherIncome.ts"),
        },

        // 2. Authentication

        {
          find: /^.*\/usePasswordReset$/,
          replacement: path.resolve(dirname, "./mocks/hooks/authentication/usePasswordReset.ts"),
        },

        {
          find: /^.*\/useSession$/,
          replacement: path.resolve(dirname, "./mocks/hooks/authentication/useSession.ts"),
        },

        // 3. Bar

        {
          find: /^.*\/useProducts$/,
          replacement: path.resolve(dirname, "./mocks/hooks/bar/useProducts.ts"),
        },

        // 4. Cart

        {
          find: /^.*\/useCartItems$/,
          replacement: path.resolve(dirname, "./mocks/hooks/cart/useCartItems.ts"),
        },

        {
          find: /^.*\/usePayNow$/,
          replacement: path.resolve(dirname, "./mocks/hooks/cart/usePayNow.ts"),
        },

        // 5. Events

        {
          find: /^.*\/useAttractions$/,
          replacement: path.resolve(dirname, "./mocks/hooks/events/useAttractions.ts"),
        },

        {
          find: /^.*\/useEvents$/,
          replacement: path.resolve(dirname, "./mocks/hooks/events/useEvents.ts"),
        },

        {
          find: /^.*\/useFavoriteEvents$/,
          replacement: path.resolve(dirname, "./mocks/hooks/events/useFavoriteEvents.ts"),
        },

        {
          find: /^.*\/useGallery$/,
          replacement: path.resolve(dirname, "./mocks/hooks/events/useGallery.ts"),
        },

        {
          find: /^.*\/useReviews$/,
          replacement: path.resolve(dirname, "./mocks/hooks/events/useReviews.ts"),
        },

        // 6. Newsletter

        {
          find: /^.*\/useNewsletter$/,
          replacement: path.resolve(dirname, "./mocks/hooks/newsletter/useNewsletter.ts"),
        },

        // 7. Users

        {
          find: /^.*\/useNotificationPreferences$/,
          replacement: path.resolve(dirname, "./mocks/hooks/users/useNotificationPreferences.ts"),
        },

        {
          find: /^.*\/useNotifications$/,
          replacement: path.resolve(dirname, "./mocks/hooks/users/useNotifications.ts"),
        },

        {
          find: /^.*\/useProfile$/,
          replacement: path.resolve(dirname, "./mocks/hooks/users/useProfile.ts"),
        },

        {
          find: /^.*\/useTicketOrder$/,
          replacement: path.resolve(dirname, "./mocks/hooks/users/useTicketOrder.ts"),
        },

        {
          find: /^.*\/useTickets$/,
          replacement: path.resolve(dirname, "./mocks/hooks/users/useTickets.ts"),
        },

        {
          find: /^.*\/useUsers$/,
          replacement: path.resolve(dirname, "./mocks/hooks/users/useUsers.ts"),
        },

        {
          find: /^.*\/useUsersStats$/,
          replacement: path.resolve(dirname, "./mocks/hooks/users/useUsersStats.ts"),
        },

        {
          find: /^.*\/useVoucherOrder$/,
          replacement: path.resolve(dirname, "./mocks/hooks/users/useVoucherOrder.ts"),
        },

        {
          find: /^.*\/useVouchers$/,
          replacement: path.resolve(dirname, "./mocks/hooks/users/useVouchers.ts"),
        },

        /* - Services - */

        // 1. Bcrypt

        {
          find: /^.*\/services\/bcrypt$/,
          replacement: path.resolve(dirname, "./mocks/services/bcrypt.ts"),
        },

        // 2. Prisma

        {
          find: /^.*\/services\/prisma$/,
          replacement: path.resolve(dirname, "./mocks/services/prisma.ts"),
        },

        // 3. Stripe

        {
          find: /^.*\/services\/stripe$/,
          replacement: path.resolve(dirname, "./mocks/services/stripe.ts"),
        },

        // 8. Aliases originais

        ...normalizedAlias,
      ],
    };

    return viteConfig;
  },
};

export default config;
