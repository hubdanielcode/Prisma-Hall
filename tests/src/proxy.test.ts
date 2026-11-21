import { expect, test } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

/* - Função para chamar o proxy como se fosse uma requisição do navegador - */

const callProxy = async (path: string, hasSession: boolean) => {
  const request = new NextRequest(`http://localhost:3000${path}`, {
    headers: hasSession ? { cookie: "validSession=session-id" } : {},
  });

  const response = await proxy(request);
  const location = response.headers.get("location");

  return {
    response,
    redirectUrl: location ? new URL(location) : null,
    passedThrough: response.headers.get("x-middleware-next") === "1",
  };
};

const protectedRoutes = ["/perfil", "/carrinho", "/admin", "/pedidos/123/detalhes-do-pedido"];
const publicRoutes = ["/", "/agenda", "/cadastro", "/sobre"];

// Cada caso é [rota, tem sessão]: as protegidas com sessão e as públicas sem sessão devem passar direto

const passThroughCases: [string, boolean][] = [
  ...protectedRoutes.map((path): [string, boolean] => [path, true]),
  ...publicRoutes.map((path): [string, boolean] => [path, false]),
];

/* - Testando rotas protegidas sem sessão - */

test.each(protectedRoutes)("should redirect %s to login when there's no session", async (path) => {
  const { redirectUrl } = await callProxy(path, false);

  expect(redirectUrl?.pathname).toBe("/login");
  expect(redirectUrl?.searchParams.get("from")).toBe(path);
});

test("should keep only the pathname in the from param", async () => {
  const { redirectUrl } = await callProxy("/perfil?aba=pedidos&from=lixo", false);

  expect(redirectUrl).not.toBeNull();
  expect(redirectUrl?.searchParams.get("from")).toBe("/perfil");
  expect(redirectUrl?.search).not.toContain("aba");
});

/* - Testando as rotas que devem passar direto - */

test.each(passThroughCases)("should let %s through when the session is %s", async (path, hasSession) => {
  const { redirectUrl, passedThrough } = await callProxy(path, hasSession);

  expect(redirectUrl).toBeNull();
  expect(passedThrough).toBe(true);
});

/* - Testando a rota de login - */

test.each([
  ["/login", "/login"],
  ["/login with a huge from param", `/login?from=${"%252F".repeat(500)}`],
])("should not redirect users who are accessing %s", async (_description, path) => {
  const { redirectUrl, passedThrough } = await callProxy(path, false);

  expect(redirectUrl).toBeNull();
  expect(passedThrough).toBe(true);
});

/* - Testando o loop de redirecionamento - */

test("should land on /login without redirecting again after the first redirect", async () => {
  const firstRedirect = await callProxy("/perfil", false);

  expect(firstRedirect.redirectUrl).not.toBeNull();

  const { pathname, search } = firstRedirect.redirectUrl!;
  const secondRedirect = await callProxy(`${pathname}${search}`, false);

  expect(secondRedirect.redirectUrl).toBeNull();
  expect(search.length).toBeLessThan(40);
});
