const compare = async (_typedPassword: string, _hashedPassword: string): Promise<boolean> => {
  return true;
};

const hash = async (_typedPassword: string, _saltRounds: number): Promise<string> => {
  return "Mocked Hashed Password";
};

export { compare, hash };
