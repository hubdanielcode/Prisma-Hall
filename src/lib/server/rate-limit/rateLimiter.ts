import "server-only";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/server/services/prisma";

interface CheckRateLimitProps {
  action: string;
  identifier?: string;
  limit: number;
  windowSeconds: number;
}

/* - Pega o IP de quem fez a requisição. Na Vercel ele vem no header x-forwarded-for - */

const getClientIp = async () => {
  const requestHeaders = await headers();

  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
};

/* - Monta o nome do contador juntando ação, IP e identificador. O identificador (e-mail) vira hash para o banco não guardar dado pessoal - */

const buildRateLimitKey = async (action: string, identifier?: string) => {
  const clientIp = await getClientIp();
  const hashedIdentifier = identifier ? createHash("sha256").update(identifier.toLowerCase()).digest("hex").slice(0, 16) : "";

  return `${action}:${clientIp}:${hashedIdentifier}`;
};

/* - Soma uma tentativa no contador e diz se ainda está dentro do limite. Se o contador não existe ou já expirou, começa um novo a partir de 1 - */

const checkRateLimit = async ({ action, identifier, limit, windowSeconds }: CheckRateLimitProps) => {
  try {
    const rateLimitKey = await buildRateLimitKey(action, identifier);
    const expiresAt = new Date(Date.now() + windowSeconds * 1000);

    const existingRateLimit = await prisma.rateLimit.findUnique({ where: { key: rateLimitKey } });

    /* - Contador novo ou expirado - */

    if (!existingRateLimit || existingRateLimit.expiresAt <= new Date()) {
      await prisma.rateLimit.upsert({
        where: { key: rateLimitKey },
        create: { key: rateLimitKey, count: 1, expiresAt: expiresAt },
        update: { count: 1, expiresAt: expiresAt },
      });

      /* - Limpeza ocasional dos contadores expirados, para a tabela não crescer sem parar - */

      if (Math.random() < 0.01) {
        await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      }

      return { allowed: true };
    }

    /* - Contador ativo: soma uma tentativa - */

    const updatedRateLimit = await prisma.rateLimit.update({
      where: { key: rateLimitKey },
      data: { count: { increment: 1 } },
    });

    return { allowed: updatedRateLimit.count <= limit };
  } catch {
    /* - Se o contador falhar, libera a tentativa: um erro aqui não pode impedir ninguém de entrar - */

    return { allowed: true };
  }
};

/* - Apaga o contador. Usado depois de um login correto, para zerar as tentativas erradas - */

const resetRateLimit = async (action: string, identifier?: string) => {
  try {
    const rateLimitKey = await buildRateLimitKey(action, identifier);

    await prisma.rateLimit.deleteMany({ where: { key: rateLimitKey } });
  } catch {
    /* - Falha silenciosa de propósito: limpar o contador não pode atrapalhar o login - */
  }
};

export { checkRateLimit, resetRateLimit };
