import { fn } from "storybook/test";

const usePasswordReset = () => ({
  requestPasswordResetMutation: fn(async (_email: string) => true as const),
  passwordResetMutation: fn(async () => true as const),
});

export { usePasswordReset };
