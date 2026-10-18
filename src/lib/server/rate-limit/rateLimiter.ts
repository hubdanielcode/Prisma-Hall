import "server-only";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

interface CheckRateLimitProps {
  action: string;
  identifier?: string;
  limit: number;
  windowSeconds: number;
  includeIp?: boolean;
  allowOnError?: boolean;
}

/* - Pega o IP de quem fez a requisição. Na Vercel, x-vercel-forwarded-for e x-forwarded-for são definidos pela própria plataforma, então o cliente não consegue forjá-los. Fora da Vercel, x-forwarded-for pode ser forjado - */

const getClientIp = async () => {
  const requestHeaders = await headers();

  return (
    requestHeaders.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
};

/* - Monta o nome do contador juntando ação, IP (opcional) e identificador. O identificador (e-mail) vira hash para o banco não guardar dado pessoal - */

const buildRateLimitKey = async (action: string, identifier?: string, includeIp: boolean = true) => {
  const clientIp = includeIp ? await getClientIp() : "unknown";
  const hashedIdentifier = identifier ? createHash("sha256").update(identifier.toLowerCase()).digest("hex").slice(0, 16) : "";

  return `${action}:${clientIp}:${hashedIdentifier}`;
};

/* - Soma uma tentativa no contador usando só operações atômicas do banco, para que requisições simultâneas não se percam - */

const incrementCounter = async (rateLimitKey: string, windowSeconds: number) => {
  const expiresAt = new Date(Date.now() + windowSeconds * 1000);

  // 1. Contador ativo: soma uma tentativa

  const incremented = await prisma.rateLimit.updateMany({
    where: { key: rateLimitKey, expiresAt: { gt: new Date() } },
    data: { count: { increment: 1 } },
  });

  if (incremented.count > 0) {
    return;
  }

  // 2. Contador inexistente: cria um novo a partir de 1

  try {
    await prisma.rateLimit.create({ data: { key: rateLimitKey, count: 1, expiresAt: expiresAt } });
    return;
  } catch (error) {
    if (!(error instanceof PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }

  // 3. Contador expirado: reinicia em 1. Só um dos pedidos simultâneos consegue reiniciar

  const reset = await prisma.rateLimit.updateMany({
    where: { key: rateLimitKey, expiresAt: { lte: new Date() } },
    data: { count: 1, expiresAt: expiresAt },
  });

  if (reset.count > 0) {
    return;
  }

  // 4. Outro pedido acabou de criar ou reiniciar o contador: soma nele

  await prisma.rateLimit.updateMany({
    where: { key: rateLimitKey },
    data: { count: { increment: 1 } },
  });
};

/* - Soma uma tentativa e diz se ainda está dentro do limite - */

const checkRateLimit = async ({ action, identifier, limit, windowSeconds, includeIp = true, allowOnError = false }: CheckRateLimitProps) => {
  try {
    const rateLimitKey = await buildRateLimitKey(action, identifier, includeIp);
    await incrementCounter(rateLimitKey, windowSeconds);

    const currentRateLimit = await prisma.rateLimit.findUnique({ where: { key: rateLimitKey } });

    /* - Em 1% das vezes, apaga os contadores expirados. O sorteio evita rodar essa limpeza a cada requisição - */

    if (Math.random() < 0.01) {
      await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    }

    if (!currentRateLimit) {
      return { allowed: allowOnError };
    }

    return { allowed: currentRateLimit.count <= limit };
  } catch {
    // Se o contador falhar, bloqueia a tentativa (allowOnError = false). Se o banco caiu, login e cadastro também não funcionariam

    return { allowed: allowOnError };
  }
};

/* - Apaga o contador. Usado depois de um login correto, para zerar as tentativas erradas. Precisa receber o mesmo includeIp usado no checkRateLimit - */

const resetRateLimit = async (action: string, identifier?: string, includeIp: boolean = true) => {
  try {
    const rateLimitKey = await buildRateLimitKey(action, identifier, includeIp);

    await prisma.rateLimit.deleteMany({ where: { key: rateLimitKey } });
  } catch {
    // Falha silenciosa de propósito: limpar o contador não pode atrapalhar o login
  }
};

export { checkRateLimit, resetRateLimit };
