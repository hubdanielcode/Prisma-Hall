import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "validSession";

/* - Rotas que exigem login. Todo o resto é público (inclusive /login e /cadastro, para nunca redirecionar para uma rota que se protege a si mesma). - */

const protectedRoutes = ["/perfil", "/carrinho", "/pedidos", "/admin"];

const isProtectedRoute = (pathname: string) => {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
};

const proxy = async (request: NextRequest) => {
  const { origin } = request.nextUrl;
  const pathname = decodeURIComponent(request.nextUrl.pathname);

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  /* - Checagem simples: só verifica se o cookie existe. A validação real da sessão fica nos layouts (validateSession). - */

  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  /* - Sem cookie: manda para o login guardando só o caminho (sem query), uma única vez, para o "from" nunca crescer - */

  const loginUrl = new URL("/login", origin);

  loginUrl.searchParams.set("from", pathname);

  return NextResponse.redirect(loginUrl);
};

export const config = {
  matcher: [
    // Pula arquivos internos do Next, estáticos e as rotas de API (webhooks e cron)
    "/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

export { proxy };
