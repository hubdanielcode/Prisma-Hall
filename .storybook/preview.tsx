import type { Preview } from "@storybook/nextjs-vite";

interface StorySortProps {
  component: string;
  title: string;
}

const preview: Preview = {
  parameters: {
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
      storySort: (a: StorySortProps, b: StorySortProps) =>
        a.title === b.title
          ? a.component.localeCompare(b.component)
          : a.title.localeCompare(b.title, undefined, { numeric: true }),
    },
  },
};

export { preview };
