import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { render } from "@react-email/components";
import { getResend } from "@/lib/server/services/resend";

/* - Mocks das dependências externas (@react-email/components e fetch) - */

vi.mock("@react-email/components", () => ({ render: vi.fn() }));

const mockRender = render as unknown as Mock;
const mockFetch = vi.fn();

/* - Funções e dados auxiliares - */

type SendEmailParams = Parameters<ReturnType<typeof getResend>["emails"]["send"]>[0];

const apiKey = "brevo-api-key";
const senderEmail = "naoresponda@prismahall.com";
const reactElement = { type: "div", props: {} } as never;

const buildParams = (overrides: Partial<SendEmailParams> = {}): SendEmailParams => ({
  from: "Prisma Hall <naoresponda@prismahall.com>",
  to: "ana@example.com",
  subject: "Pagamento confirmado",
  text: "Olá, Ana!",
  ...overrides,
});

const buildResponse = ({ ok = true, status = 200, body = {} }: { ok?: boolean; status?: number; body?: Record<string, unknown> } = {}) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(body),
});

const getRequestBody = () => JSON.parse(mockFetch.mock.calls[0][1].body);

const sendEmail = (params: SendEmailParams) => getResend().emails.send(params);

beforeEach(() => {
  vi.stubEnv("BREVO_API_KEY", apiKey);
  vi.stubEnv("EMAIL_FROM_ADDRESS", senderEmail);
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockResolvedValue(buildResponse({ body: { messageId: "message-1" } }));
  mockRender.mockResolvedValue("<p>Olá, Ana!</p>");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

/* - Testando a interface - */

test("should expose the send function in the emails object", () => {
  const resend = getResend();

  expect(typeof resend.emails.send).toBe("function");
});

/* - Testando a configuração ausente - */

test.each([
  ["BREVO_API_KEY", { BREVO_API_KEY: "" }],
  ["EMAIL_FROM_ADDRESS", { EMAIL_FROM_ADDRESS: "" }],
  ["both variables", { BREVO_API_KEY: "", EMAIL_FROM_ADDRESS: "" }],
])("should return the missing_config error and skip brevo when %s is missing", async (_description, environment) => {
  Object.entries(environment).forEach(([name, value]) => vi.stubEnv(name, value));

  const result = await sendEmail(buildParams());

  expect(result).toEqual({
    data: null,
    error: { name: "missing_config", message: "Defina BREVO_API_KEY e EMAIL_FROM_ADDRESS no .env" },
  });
  expect(mockFetch).not.toHaveBeenCalled();
});

/* - Testando a requisição ao Brevo - */

test("should post the email to the brevo api with the api key", async () => {
  await sendEmail(buildParams());

  expect(mockFetch).toHaveBeenCalledTimes(1);

  const [url, options] = mockFetch.mock.calls[0];

  expect(url).toBe("https://api.brevo.com/v3/smtp/email");
  expect(options.method).toBe("POST");
  expect(options.headers).toEqual({ accept: "application/json", "content-type": "application/json", "api-key": apiKey });
});

test("should send the text email with the sender from the environment, the recipient and the subject", async () => {
  await sendEmail(buildParams());

  expect(getRequestBody()).toEqual({
    sender: { name: "Prisma Hall", email: senderEmail },
    to: [{ email: "ana@example.com" }],
    subject: "Pagamento confirmado",
    textContent: "Olá, Ana!",
  });
});

test.each([
  ["the name before the address", "Prisma Hall <naoresponda@prismahall.com>", "Prisma Hall"],
  ["the name without the extra spaces", "  Equipe Prisma   <contato@prismahall.com>", "Equipe Prisma"],
  ["the default name when the sender has no name and no brackets", "naoresponda@prismahall.com", "Prisma Hall"],
])("should use %s as the sender name", async (_description, from, expectedName) => {
  await sendEmail(buildParams({ from }));

  expect(getRequestBody().sender).toEqual({ name: expectedName, email: senderEmail });
});

test("should never use the address of the from field as the sender email", async () => {
  await sendEmail(buildParams({ from: "Outro Nome <outro@example.com>" }));

  expect(getRequestBody().sender.email).toBe(senderEmail);
});

/* - Testando o conteúdo do email - */

test("should render the react element to html and send it together with the text", async () => {
  await sendEmail(buildParams({ react: reactElement }));

  expect(mockRender).toHaveBeenCalledTimes(1);
  expect(mockRender).toHaveBeenCalledWith(reactElement);
  expect(getRequestBody()).toEqual(expect.objectContaining({ htmlContent: "<p>Olá, Ana!</p>", textContent: "Olá, Ana!" }));
});

test("should send only the html when there is no text", async () => {
  await sendEmail(buildParams({ react: reactElement, text: undefined }));

  const body = getRequestBody();

  expect(body.htmlContent).toBe("<p>Olá, Ana!</p>");
  expect(body).not.toHaveProperty("textContent");
});

test("should skip the render and send no html when there is no react element", async () => {
  await sendEmail(buildParams());

  expect(mockRender).not.toHaveBeenCalled();
  expect(getRequestBody()).not.toHaveProperty("htmlContent");
});

test("should leave out an empty text and an empty html from the request", async () => {
  mockRender.mockResolvedValue("");

  await sendEmail(buildParams({ react: reactElement, text: "" }));

  const body = getRequestBody();

  expect(body).not.toHaveProperty("htmlContent");
  expect(body).not.toHaveProperty("textContent");
});

/* - Testando o resultado - */

test("should return the message id from brevo and no error when the email is sent", async () => {
  const result = await sendEmail(buildParams());

  expect(result).toEqual({ data: { id: "message-1" }, error: null });
});

test("should return an empty id when brevo does not inform the message id", async () => {
  mockFetch.mockResolvedValue(buildResponse({ body: {} }));

  const result = await sendEmail(buildParams());

  expect(result).toEqual({ data: { id: "" }, error: null });
});

test("should return an empty id when the successful response has no readable body", async () => {
  mockFetch.mockResolvedValue({ ok: true, status: 201, json: vi.fn().mockRejectedValue(new Error("invalid json")) });

  const result = await sendEmail(buildParams());

  expect(result).toEqual({ data: { id: "" }, error: null });
});

/* - Testando as respostas de erro do Brevo - */

test("should return the code and the message from brevo when the response is not ok", async () => {
  mockFetch.mockResolvedValue(buildResponse({ ok: false, status: 401, body: { code: "unauthorized", message: "Key not found" } }));

  const result = await sendEmail(buildParams());

  expect(result).toEqual({ data: null, error: { name: "unauthorized", message: "Key not found" } });
});

test("should convert a numeric code from brevo to text", async () => {
  mockFetch.mockResolvedValue(buildResponse({ ok: false, status: 429, body: { code: 1001, message: "Too many requests" } }));

  const result = await sendEmail(buildParams());

  expect(result.error).toEqual({ name: "1001", message: "Too many requests" });
});

test.each([
  ["has no code and no message", buildResponse({ ok: false, status: 400, body: {} })],
  ["cannot be read", { ok: false, status: 400, json: vi.fn().mockRejectedValue(new Error("invalid json")) }],
])("should return the status as the name and the default message when the error body %s", async (_description, response) => {
  mockFetch.mockResolvedValue(response);

  const result = await sendEmail(buildParams());

  expect(result).toEqual({ data: null, error: { name: "400", message: "Falha ao enviar pelo Brevo" } });
});

/* - Testando as falhas de rede - */

test("should return the network_error with the message of the error when the request fails", async () => {
  mockFetch.mockRejectedValue(new Error("socket hang up"));

  const result = await sendEmail(buildParams());

  expect(result).toEqual({ data: null, error: { name: "network_error", message: "socket hang up" } });
});

test("should return the unknown error message when the request fails with something that is not an error", async () => {
  mockFetch.mockRejectedValue("falhou");

  const result = await sendEmail(buildParams());

  expect(result).toEqual({ data: null, error: { name: "network_error", message: "Erro desconhecido" } });
});

test("should return the network_error and skip brevo when rendering the email fails", async () => {
  mockRender.mockRejectedValue(new Error("render error"));

  const result = await sendEmail(buildParams({ react: reactElement }));

  expect(result).toEqual({ data: null, error: { name: "network_error", message: "render error" } });
  expect(mockFetch).not.toHaveBeenCalled();
});
