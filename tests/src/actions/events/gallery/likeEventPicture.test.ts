import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { likeEventPicture } from "@/actions/events/gallery/likeEventPicture";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindUniquePicture = prisma.gallery.findUnique as unknown as Mock;
const mockFindUniqueLike = prisma.galleryLikes.findUnique as unknown as Mock;
const mockCreateLike = prisma.galleryLikes.create as unknown as Mock;
const mockDeleteLike = prisma.galleryLikes.delete as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const likeKey = { userId_imageId: { userId: "user 1", imageId: "picture 1" } };

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniquePicture.mockResolvedValue({ id: "picture 1" });
  mockFindUniqueLike.mockResolvedValue(null);
  mockCreateLike.mockResolvedValue({});
  mockDeleteLike.mockResolvedValue({});
});

/* - Testando a sessão - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await likeEventPicture("picture 1");

  expect(result).toBe(false);
  expect(mockFindUniquePicture).not.toHaveBeenCalled();
  expect(mockCreateLike).not.toHaveBeenCalled();
  expect(mockDeleteLike).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the picture and then for the like of the user in the session", async () => {
  await likeEventPicture("picture 1");

  expect(mockFindUniquePicture).toHaveBeenCalledWith({ where: { id: "picture 1" } });
  expect(mockFindUniqueLike).toHaveBeenCalledWith({ where: likeKey });
});

test("should return false and skip the like when the picture does not exist", async () => {
  mockFindUniquePicture.mockResolvedValue(null);

  const result = await likeEventPicture("picture 1");

  expect(result).toBe(false);
  expect(mockFindUniqueLike).not.toHaveBeenCalled();
  expect(mockCreateLike).not.toHaveBeenCalled();
  expect(mockDeleteLike).not.toHaveBeenCalled();
});

/* - Testando a curtida nova - */

test("should create the like and return liked as true when the user has not liked the picture yet", async () => {
  const result = await likeEventPicture("picture 1");

  expect(mockCreateLike).toHaveBeenCalledTimes(1);
  expect(mockCreateLike).toHaveBeenCalledWith({ data: { userId: "user 1", imageId: "picture 1" } });
  expect(mockDeleteLike).not.toHaveBeenCalled();
  expect(result).toEqual({ pictureId: "picture 1", liked: true });
});

/* - Testando a remoção da curtida - */

test("should delete the like and return liked as false when the user already liked the picture", async () => {
  mockFindUniqueLike.mockResolvedValue({ userId: "user 1", imageId: "picture 1" });

  const result = await likeEventPicture("picture 1");

  expect(mockDeleteLike).toHaveBeenCalledTimes(1);
  expect(mockDeleteLike).toHaveBeenCalledWith({ where: likeKey });
  expect(mockCreateLike).not.toHaveBeenCalled();
  expect(result).toEqual({ pictureId: "picture 1", liked: false });
});

/* - Testando as falhas do banco - */

test.each([
  ["looking for the picture", () => mockFindUniquePicture],
  ["looking for the like", () => mockFindUniqueLike],
  ["creating the like", () => mockCreateLike],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await likeEventPicture("picture 1");

  expect(result).toBe(false);
});

test("should return false when deleting the like fails", async () => {
  mockFindUniqueLike.mockResolvedValue({ userId: "user 1", imageId: "picture 1" });
  mockDeleteLike.mockRejectedValue(new Error("db error"));

  const result = await likeEventPicture("picture 1");

  expect(result).toBe(false);
});
