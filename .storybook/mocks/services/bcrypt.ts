const compare = async (_typedPassword: string, _hashedPassword: string) => {
  return true;
};

const hash = async (_typedPassword: string, _saltRounds: number) => {
  return "Mocked Hashed Password";
};

export { compare, hash };
