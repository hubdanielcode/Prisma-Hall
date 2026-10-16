import "server-only";
import { compare as bcryptCompare, hash as bcryptHash } from "bcrypt";

const compare = async (typedPassword: string, hashedPassword: string) => {
  return bcryptCompare(typedPassword, hashedPassword);
};

const hash = async (typedPassword: string, saltRounds: number) => {
  return bcryptHash(typedPassword, saltRounds);
};

export { compare, hash };
