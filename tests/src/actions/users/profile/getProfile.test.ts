import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getProfile } from "@/actions/users/profile/getProfile";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindUniqueUser = prisma.user.findUnique as unknown as Mock;
const mockFindUniqueProfile = prisma.profile.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildDatabaseUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user 1",
  name: "Maria Silva",
  profilePicture: "https://blob.test/picture.png",
  role: "user",
  verifiedBadge: true,
  oldUser: false,
  frequentUser: true,
  createdAt: new Date("2026-01-01T10:00:00.000Z"),
  validatedAt: new Date("2026-01-02T10:00:00.000Z"),
  updatedAt: new Date("2026-01-10T10:00:00.000Z"),
  ...overrides,
});

const buildDatabaseProfile = (overrides: Record<string, unknown> = {}) => ({
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
  ...overrides,
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueUser.mockResolvedValue(buildDatabaseUser());
  mockFindUniqueProfile.mockResolvedValue(buildDatabaseProfile());
});

/* - Testando a sessão - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await getProfile();

  expect(result).toBe(false);
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockFindUniqueProfile).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the user and the profile of the logged user, selecting only the needed fields", async () => {
  await getProfile();

  expect(mockFindUniqueUser).toHaveBeenCalledWith({
    where: { id: "user 1" },
    select: {
      id: true,
      name: true,
      profilePicture: true,
      role: true,
      verifiedBadge: true,
      oldUser: true,
      frequentUser: true,
      createdAt: true,
      validatedAt: true,
      updatedAt: true,
    },
  });

  expect(mockFindUniqueProfile).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    select: {
      phoneNumber: true,
      socialSecurityNumber: true,
      birthDate: true,
      zipCode: true,
      city: true,
      state: true,
      neighborhood: true,
      street: true,
      number: true,
      complement: true,
    },
  });
});

/* - Testando o resultado - */

test("should return the user data together with the profile data", async () => {
  const result = await getProfile();

  expect(result).toEqual({ ...buildDatabaseUser(), ...buildDatabaseProfile() });
});

test("should return only the user data when the user has no profile yet", async () => {
  mockFindUniqueProfile.mockResolvedValue(null);

  const result = await getProfile();

  expect(result).toEqual(buildDatabaseUser());
});

test("should return false and skip the profile when the user does not exist", async () => {
  mockFindUniqueUser.mockResolvedValue(null);

  const result = await getProfile();

  expect(result).toBe(false);
  expect(mockFindUniqueProfile).not.toHaveBeenCalled();
});

/* - Testando as falhas - */

test.each([
  ["looking for the user", () => mockFindUniqueUser],
  ["looking for the profile", () => mockFindUniqueProfile],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  const result = await getProfile();

  expect(result).toBe(false);
});
