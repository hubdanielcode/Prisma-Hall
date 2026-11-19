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

const protectedRoutes = ["/perfil", "/carrinho", "/admin"];
const publicRoutes = ["/", "/agenda", "/cadastro", "/sobre"];

/* - Testando rotas protegidas sem sessão - */

test.each(protectedRoutes)("should redirect %s to login when there's no session", async (path) => {
  const { redirectUrl } = await callProxy(path, false);

  expect(redirectUrl?.pathname).toBe("/login");
  expect(redirectUrl?.searchParams.get("from")).toBe(path);
});

test("should redirect nested order routes to login when there's no session", async () => {
  const path = "/pedidos/123/detalhes-do-pedido";
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

/* - Testando rotas protegidas com sessão - */

test.each(protectedRoutes)("should let %s through when there's a session cookie", async (path) => {
  const { redirectUrl, passedThrough } = await callProxy(path, true);

  expect(redirectUrl).toBeNull();
  expect(passedThrough).toBe(true);
});

/* - Testando rotas públicas - */

test.each(publicRoutes)("should let %s through even without a session", async (path) => {
  const { redirectUrl, passedThrough } = await callProxy(path, false);

  expect(redirectUrl).toBeNull();
  expect(passedThrough).toBe(true);
});

/* - Testando a rota de login - */

test("should not redirect users who are accessing /login", async () => {
  const { redirectUrl, passedThrough } = await callProxy("/login", false);

  expect(redirectUrl).toBeNull();
  expect(passedThrough).toBe(true);
});

test("should not redirect users accessing /login even with a huge from param", async () => {
  const { redirectUrl } = await callProxy(`/login?from=${"%252F".repeat(500)}`, false);

  expect(redirectUrl).toBeNull();
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
