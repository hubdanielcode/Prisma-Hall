import "server-only";
import { prisma } from "../services/prisma";

interface SessionProps {
  userId: string;
  expiresAt: Date;
}

const createSession = async ({ userId, expiresAt }: SessionProps) => {
  /* - Limpa as sessões expiradas desse usuário antes de criar a nova - */

  await prisma.session.deleteMany({ where: { userId: userId, expiresAt: { lt: new Date() } } });

  return prisma.session.create({ data: { userId: userId, expiresAt: expiresAt } });
};

export { createSession };
