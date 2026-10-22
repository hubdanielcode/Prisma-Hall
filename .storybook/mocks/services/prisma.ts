const arrayReturningMethods = new Set(["findMany"]);
const countReturningMethods = new Set(["count"]);

/* - Mockando o model - */

// 1. Interceptando o método chamado (findMany, findUnique, create, update...)

const createModel = () =>
  new Proxy(
    {},
    {
      get: (_target, method: string) => {
        return async (..._arguments: unknown[]) => {
          if (arrayReturningMethods.has(method)) {
            return [];
          }

          if (countReturningMethods.has(method)) {
            return 0;
          }

          return null;
        };
      },
    },
  );

/* - Mockando o client - */

// 1. Interceptando o model correto (product, event, attraction, ticket, voucher...) e devolvendo o mock de cima

const prisma = new Proxy(
  {},
  {
    get: () => createModel(),
  },
);

/* - Mockando o erro do runtime do Prisma (usado nas actions: instanceof PrismaClientKnownRequestError) - */

class PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, unknown>;

  constructor(message: string, options?: { code?: string; meta?: Record<string, unknown> }) {
    super(message);
    this.name = "PrismaClientKnownRequestError";
    this.code = options?.code ?? "P0000";
    this.meta = options?.meta;
  }
}

/* - Mock do "next/server" (requestPasswordReset usa "after"; o módulo real usa __dirname e quebra no navegador) - */

const after = (_callback: unknown) => {};

class NextResponse extends Response {
  static json(body: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(body), init);
  }
}

export { prisma, PrismaClientKnownRequestError, after, NextResponse };
