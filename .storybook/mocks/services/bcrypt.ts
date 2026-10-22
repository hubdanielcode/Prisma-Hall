const compare = async (_typedPassword: string, _hashedPassword: string) => {
  return true;
};

const hash = async (_typedPassword: string, _saltRounds: number) => {
  return "Mocked Hashed Password";
};

/* - Mock do módulo "crypto" do Node (usado em rateLimiter e makeAnonymous, que o Storybook acaba importando) - */

const createHash = (_algorithm: string) => {
  const hasher = {
    update: (_data: string) => hasher,
    digest: (_encoding: string) => "mockedhash0000000000000000000000000000000000000000000000000000",
  };

  return hasher;
};

const randomUUID = () => "00000000-0000-4000-8000-000000000000";

export { compare, hash, createHash, randomUUID };
