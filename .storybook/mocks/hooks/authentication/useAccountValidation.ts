import { fn } from "storybook/test";

const useAccountValidation = () => ({
  validateAccountMutation: fn(async (_token: string) => true as const),
  resendValidationEmailMutation: fn(async (_email: string) => true as const),
});

export { useAccountValidation };
