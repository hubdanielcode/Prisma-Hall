const arrayReturningMethods = new Set(["findMany"]);
const countReturningMethods = new Set(["count"]);

/* - Mockando o model - */

// 1. Interceptando o método chamado (findMany, findUnique, create, update...)

const createModelMock = () =>
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
    get: () => createModelMock(),
  },
);

export { prisma };
