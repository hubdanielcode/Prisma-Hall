import { prisma } from "@/lib/prisma";

interface SessionProps {
  userId: string;
  expiresAt: Date;
}

const createSession = async ({ userId, expiresAt }: SessionProps) => {
  const newSession = await prisma.session.create({
    data: { userId, expiresAt },
  });
  return newSession;
};

export { createSession };
