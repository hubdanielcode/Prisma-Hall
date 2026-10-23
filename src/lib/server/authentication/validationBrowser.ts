import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/* - Abrir o link do email não cria sessão por si só. No cadastro, o navegador recebe um cookie com uma chave secreta, e o banco guarda apenas o hash dessa chave. Quando o link é aberto, a sessão só é criada se o navegador trouxer uma chave cujo hash bata com o do banco, ou seja, se for o mesmo navegador do cadastro. Em qualquer outro caso (email encaminhado, scanner de eemail, outro aparelho), a conta é validada, mas o usuário entra pelo fluxo de login normal, com email e senha - */

const validationBrowserCookieName = "pendingValidation";
const validationBrowserLifetimeInSeconds = 60 * 15;

const hashValidationBrowserKey = (validationBrowserKey: string) => {
  return createHash("sha256").update(validationBrowserKey).digest("hex");
};

const setValidationBrowserCookie = async (validationBrowserKey: string) => {
  const cookieStore = await cookies();

  cookieStore.set(validationBrowserCookieName, validationBrowserKey, {
    httpOnly: true,
    secure: true,
    maxAge: validationBrowserLifetimeInSeconds,
    sameSite: "lax",
    path: "/",
  });
};

// 1. Cadastro: cria a chave, entrega no cookie e devolve o hash para ser guardado no banco

const startValidationBrowser = async () => {
  const validationBrowserKey = randomBytes(32).toString("hex");

  await setValidationBrowserCookie(validationBrowserKey);

  return hashValidationBrowserKey(validationBrowserKey);
};

// 2. Reenvio: se este navegador já tem a chave do cadastro, renova o cookie e devolve o hash; se não tem, devolve null (o link novo não entra direto)

const renewValidationBrowser = async () => {
  const cookieStore = await cookies();
  const validationBrowserKey = cookieStore.get(validationBrowserCookieName)?.value;

  if (!validationBrowserKey) {
    return null;
  }

  await setValidationBrowserCookie(validationBrowserKey);

  return hashValidationBrowserKey(validationBrowserKey);
};

// 3. Validação: lê o hash da chave que o navegador trouxe (null se não trouxe nenhuma)

const readValidationBrowserHash = async () => {
  const cookieStore = await cookies();
  const validationBrowserKey = cookieStore.get(validationBrowserCookieName)?.value;

  return validationBrowserKey ? hashValidationBrowserKey(validationBrowserKey) : null;
};

// 4. Compara os dois hashes em tempo constante

const doesValidationBrowserMatch = ({
  storedValidationBrowserHash,
  browserValidationBrowserHash,
}: {
  storedValidationBrowserHash: string | null;
  browserValidationBrowserHash: string | null;
}) => {
  if (!storedValidationBrowserHash || !browserValidationBrowserHash) {
    return false;
  }

  const storedValidationBrowserBuffer = Buffer.from(storedValidationBrowserHash);
  const browserValidationBrowserBuffer = Buffer.from(browserValidationBrowserHash);

  return (
    storedValidationBrowserBuffer.length === browserValidationBrowserBuffer.length &&
    timingSafeEqual(storedValidationBrowserBuffer, browserValidationBrowserBuffer)
  );
};

// 5. Depois de usar a chave, apaga o cookie

const clearValidationBrowserCookie = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(validationBrowserCookieName);
};

export { clearValidationBrowserCookie, doesValidationBrowserMatch, readValidationBrowserHash, renewValidationBrowser, startValidationBrowser };
