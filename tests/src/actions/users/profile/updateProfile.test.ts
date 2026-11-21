import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { del, put } from "@vercel/blob";
import { newProfileSchema, updateProfileSchema } from "@/lib/validations";
import { prisma } from "@/lib/server/services/prisma";
import { updateProfile } from "@/actions/users/profile/updateProfile";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma e @vercel/blob vêm do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/validations", () => ({
  updateProfileSchema: { safeParse: vi.fn() },
  newProfileSchema: { safeParse: vi.fn() },
}));

const mockValidateSession = validateSession as unknown as Mock;
const mockPut = put as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockParseUpdateProfile = updateProfileSchema.safeParse as unknown as Mock;
const mockParseNewProfile = newProfileSchema.safeParse as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;
const mockUpdateUser = prisma.user.update as unknown as Mock;
const mockFindUniqueProfile = prisma.profile.findUnique as unknown as Mock;
const mockUpdateProfile = prisma.profile.update as unknown as Mock;
const mockCreateProfile = prisma.profile.create as unknown as Mock;

/* - Funções e dados auxiliares - */

type UpdateProfileInput = Parameters<typeof updateProfile>[0];

const now = new Date("2026-01-15T18:00:00.000Z");
const oldPictureUrl = "https://blob.test/old-picture.png";
const newPictureUrl = "https://blob.test/new-picture.png";
const picture = new File(["picture"], "photo.png", { type: "image/png" });

const profileFields = {
  phoneNumber: "11999998888",
  socialSecurityNumber: "12345678900",
  birthDate: new Date("1990-05-20T00:00:00.000Z"),
  zipCode: "01001000",
  city: "São Paulo",
  state: "SP",
  neighborhood: "Sé",
  street: "Praça da Sé",
  number: "100",
  complement: "Apto 12",
};

const buildInput = (overrides: Record<string, unknown> = {}) => ({ name: "Maria Silva", ...overrides }) as unknown as UpdateProfileInput;

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildDatabaseUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user 1",
  name: "Maria Silva",
  profilePicture: oldPictureUrl,
  ...overrides,
});

const buildDatabaseProfile = (overrides: Record<string, unknown> = {}) => ({ id: "profile 1", userId: "user 1", ...profileFields, ...overrides });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  // Os schemas são mockados: aqui o que importa é o que a action faz com o resultado da validação
  mockParseUpdateProfile.mockImplementation((value: unknown) => ({ success: true, data: value }));
  mockParseNewProfile.mockImplementation((value: unknown) => ({ success: true, data: value }));

  // O client da transação é o próprio prisma mockado
  mockTransaction.mockImplementation(async (callback: (transaction: typeof prisma) => Promise<unknown>) => callback(prisma));

  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueProfile.mockResolvedValue(buildDatabaseProfile());
  mockUpdateUser.mockResolvedValue(buildDatabaseUser());
  mockUpdateProfile.mockResolvedValue(buildDatabaseProfile());
  mockCreateProfile.mockResolvedValue(buildDatabaseProfile());
  mockPut.mockResolvedValue({ url: newPictureUrl });
  mockDel.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database and the blob when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await updateProfile(buildInput());

  expect(result).toBe(false);
  expect(mockParseUpdateProfile).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
});

test("should return false and skip the database and the blob when the input is invalid", async () => {
  mockParseUpdateProfile.mockReturnValue({ success: false });

  const result = await updateProfile(buildInput({ profilePicture: picture }));

  expect(result).toBe(false);
  expect(mockFindUniqueProfile).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
});

/* - Testando a atualização do usuário - */

test("should update the name of the logged user inside a transaction", async () => {
  await updateProfile(buildInput({ name: "Maria Souza" }));

  expect(mockFindUniqueProfile).toHaveBeenCalledWith({ where: { userId: "user 1" } });
  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockUpdateUser).toHaveBeenCalledWith({ where: { id: "user 1" }, data: { name: "Maria Souza" } });
});

test("should not touch the profile when the input has no profile data and the profile already exists", async () => {
  await updateProfile(buildInput());

  expect(mockUpdateProfile).not.toHaveBeenCalled();
  expect(mockCreateProfile).not.toHaveBeenCalled();
  expect(mockParseNewProfile).not.toHaveBeenCalled();
});

/* - Testando a atualização do perfil existente - */

test("should update the profile of the logged user when it already exists and the input has profile data", async () => {
  await updateProfile(buildInput({ city: "Campinas", state: "SP" }));

  expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
  expect(mockUpdateProfile).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    data: expect.objectContaining({ city: "Campinas", state: "SP" }),
  });
  expect(mockCreateProfile).not.toHaveBeenCalled();
  expect(mockParseNewProfile).not.toHaveBeenCalled();
});

test("should return the data of the updated profile", async () => {
  mockUpdateProfile.mockResolvedValue(buildDatabaseProfile({ city: "Campinas" }));

  const result = await updateProfile(buildInput({ city: "Campinas" }));

  expect(result).toEqual({
    name: "Maria Silva",
    profilePicture: oldPictureUrl,
    ...profileFields,
    city: "Campinas",
  });
});

/* - Testando a criação do perfil - */

test("should require every profile field and create the profile when it does not exist and the input has profile data", async () => {
  mockFindUniqueProfile.mockResolvedValue(null);

  const input = buildInput(profileFields);

  await updateProfile(input);

  expect(mockParseNewProfile).toHaveBeenCalledWith(input);
  expect(mockCreateProfile).toHaveBeenCalledTimes(1);
  expect(mockCreateProfile).toHaveBeenCalledWith({ data: { userId: "user 1", ...input } });
  expect(mockUpdateProfile).not.toHaveBeenCalled();
});

test("should return false and skip the database when the profile does not exist and the profile data is incomplete", async () => {
  mockFindUniqueProfile.mockResolvedValue(null);
  mockParseNewProfile.mockReturnValue({ success: false });

  const result = await updateProfile(buildInput({ city: "Campinas" }));

  expect(result).toBe(false);
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockUpdateUser).not.toHaveBeenCalled();
  expect(mockCreateProfile).not.toHaveBeenCalled();
});

test("should only update the user when the profile does not exist and the input has no profile data", async () => {
  mockFindUniqueProfile.mockResolvedValue(null);

  const result = await updateProfile(buildInput());

  expect(mockParseNewProfile).not.toHaveBeenCalled();
  expect(mockCreateProfile).not.toHaveBeenCalled();
  expect(mockUpdateUser).toHaveBeenCalledTimes(1);
  expect(result).toEqual({
    name: "Maria Silva",
    profilePicture: oldPictureUrl,
    phoneNumber: undefined,
    socialSecurityNumber: undefined,
    birthDate: undefined,
    zipCode: undefined,
    city: undefined,
    state: undefined,
    neighborhood: undefined,
    street: undefined,
    number: undefined,
    complement: undefined,
  });
});

test("should return the data of the created profile", async () => {
  mockFindUniqueProfile.mockResolvedValue(null);

  const result = await updateProfile(buildInput(profileFields));

  expect(result).toEqual({ name: "Maria Silva", profilePicture: oldPictureUrl, ...profileFields });
});

/* - Testando a foto de perfil - */

test("should not use the blob when the input has no picture", async () => {
  await updateProfile(buildInput());

  expect(mockPut).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
  expect(mockUpdateUser).toHaveBeenCalledTimes(1);
});

test("should upload the new picture only after the data is saved", async () => {
  await updateProfile(buildInput({ profilePicture: picture }));

  expect(mockPut).toHaveBeenCalledTimes(1);
  expect(mockPut).toHaveBeenCalledWith(`${now.getTime()}-photo.png`, picture, { access: "public" });
  expect(mockPut.mock.invocationCallOrder[0]).toBeGreaterThan(mockTransaction.mock.invocationCallOrder[0]);
});

test("should save the address of the new picture in the user and then remove the old one", async () => {
  await updateProfile(buildInput({ profilePicture: picture }));

  expect(mockUpdateUser).toHaveBeenCalledTimes(2);
  expect(mockUpdateUser).toHaveBeenLastCalledWith({ where: { id: "user 1" }, data: { profilePicture: newPictureUrl } });
  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(oldPictureUrl);
  expect(mockDel.mock.invocationCallOrder[0]).toBeGreaterThan(mockUpdateUser.mock.invocationCallOrder[1]);
});

test("should return the address of the new picture", async () => {
  const result = await updateProfile(buildInput({ profilePicture: picture }));

  expect(result).toEqual(expect.objectContaining({ profilePicture: newPictureUrl }));
});

test("should not remove anything from the blob when the user had no picture before", async () => {
  mockUpdateUser.mockResolvedValue(buildDatabaseUser({ profilePicture: null }));

  const result = await updateProfile(buildInput({ profilePicture: picture }));

  expect(mockDel).not.toHaveBeenCalled();
  expect(result).toEqual(expect.objectContaining({ profilePicture: newPictureUrl }));
});

test("should still return the updated profile when removing the old picture fails", async () => {
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await updateProfile(buildInput({ profilePicture: picture }));

  expect(result).toEqual(expect.objectContaining({ name: "Maria Silva", profilePicture: newPictureUrl }));
});

test("should return picture_upload_failed and keep the old picture when the upload fails", async () => {
  mockPut.mockRejectedValue(new Error("blob error"));

  const result = await updateProfile(buildInput({ profilePicture: picture }));

  expect(result).toBe("picture_upload_failed");
  expect(mockUpdateUser).toHaveBeenCalledTimes(1);
  expect(mockDel).not.toHaveBeenCalled();
});

test("should remove the new picture and return picture_upload_failed when saving its address fails", async () => {
  mockUpdateUser.mockResolvedValueOnce(buildDatabaseUser()).mockRejectedValueOnce(new Error("service error"));

  const result = await updateProfile(buildInput({ profilePicture: picture }));

  expect(result).toBe("picture_upload_failed");
  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(newPictureUrl);
  expect(mockDel).not.toHaveBeenCalledWith(oldPictureUrl);
});

test("should still return picture_upload_failed when removing the new picture also fails", async () => {
  mockUpdateUser.mockResolvedValueOnce(buildDatabaseUser()).mockRejectedValueOnce(new Error("service error"));
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await updateProfile(buildInput({ profilePicture: picture }));

  expect(result).toBe("picture_upload_failed");
});

/* - Testando as falhas - */

test.each([
  ["looking for the profile", () => mockFindUniqueProfile],
  ["running the transaction", () => mockTransaction],
])("should return false and skip the blob when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  const result = await updateProfile(buildInput({ profilePicture: picture }));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
});

test.each([
  ["updating the user", () => mockUpdateUser],
  ["updating the profile", () => mockUpdateProfile],
])("should return false and skip the blob when %s fails inside the transaction", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  const result = await updateProfile(buildInput({ city: "Campinas", profilePicture: picture }));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
});

test("should return false and skip the blob when creating the profile fails inside the transaction", async () => {
  mockFindUniqueProfile.mockResolvedValue(null);
  mockCreateProfile.mockRejectedValue(new Error("service error"));

  const result = await updateProfile(buildInput({ ...profileFields, profilePicture: picture }));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
});
