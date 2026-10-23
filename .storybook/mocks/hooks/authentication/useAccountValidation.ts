import { fn } from "storybook/test";

/* - Estado do mock: cada story pode trocar o que o hook devolve, e o padrão volta quando a story termina - */

type ResendValidationResult = boolean | "too_soon" | "too_many_attempts";

interface AccountValidationMockProps {
  validateAccountMutation: (token: string) => Promise<string | boolean>;
  resendValidationEmailMutation: (email: string) => Promise<ResendValidationResult>;
}

const getDefaultAccountValidationMock = (): AccountValidationMockProps => ({
  validateAccountMutation: fn(async (_token: string) => "validated" as const),
  resendValidationEmailMutation: fn(async (_email: string) => true as const),
});

let accountValidationMock = getDefaultAccountValidationMock();

const setAccountValidationMock = (overrides: Partial<AccountValidationMockProps>) => {
  accountValidationMock = { ...getDefaultAccountValidationMock(), ...overrides };
};

const resetAccountValidationMock = () => {
  accountValidationMock = getDefaultAccountValidationMock();
};

const useAccountValidation = () => accountValidationMock;

export { useAccountValidation, setAccountValidationMock, resetAccountValidationMock };
export type { AccountValidationMockProps };
