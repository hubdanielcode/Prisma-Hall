import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getEventPictures } from "@/actions/events/gallery/getEventPictures";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindManyPictures = prisma.gallery.findMany as unknown as Mock;
const mockGroupByLikes = prisma.galleryLikes.groupBy as unknown as Mock;
const mockFindManyLikes = prisma.galleryLikes.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildDatabasePicture = (overrides: Record<string, unknown> = {}) => ({
  id: "picture 1",
  userId: "user 9",
  eventId: "event 1",
  image: "https://blob.vercel-storage.com/1700000000000-foto.png",
  title: "Show de abertura",
  happenedAt: new Date("2026-01-05T22:00:00.000Z"),
  event: { tag: "rock" },
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const expectedPicture = {
  id: "picture 1",
  userId: "user 9",
  eventId: "event 1",
  image: "https://blob.vercel-storage.com/1700000000000-foto.png",
  title: "Show de abertura",
  tag: "rock",
  happenedAt: "2026-01-05T22:00:00.000Z",
  likes: 0,
  likedByMe: false,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
};

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindManyPictures.mockResolvedValue([]);
  mockGroupByLikes.mockResolvedValue([]);
  mockFindManyLikes.mockResolvedValue([]);
});

/* - Testando a consulta ao banco - */

test("should look for the pictures with the tag of the event ordered by the newest first", async () => {
  await getEventPictures();

  expect(mockFindManyPictures).toHaveBeenCalledTimes(1);
  expect(mockFindManyPictures).toHaveBeenCalledWith({
    include: { event: { select: { tag: true } } },
    orderBy: { happenedAt: "desc" },
  });
});

test("should count the likes of the listed pictures grouped by picture", async () => {
  mockFindManyPictures.mockResolvedValue([buildDatabasePicture({ id: "picture 1" }), buildDatabasePicture({ id: "picture 2" })]);

  await getEventPictures();

  expect(mockGroupByLikes).toHaveBeenCalledWith({
    by: ["imageId"],
    where: { imageId: { in: ["picture 1", "picture 2"] } },
    _count: { _all: true },
  });
});

test("should look for the likes of the user in the session among the listed pictures", async () => {
  mockFindManyPictures.mockResolvedValue([buildDatabasePicture({ id: "picture 1" }), buildDatabasePicture({ id: "picture 2" })]);

  await getEventPictures();

  expect(mockFindManyLikes).toHaveBeenCalledWith({ where: { userId: "user 1", imageId: { in: ["picture 1", "picture 2"] } } });
});

/* - Testando a sessão - */

test("should keep the gallery public and skip the likes of the user when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);
  mockFindManyPictures.mockResolvedValue([buildDatabasePicture()]);
  mockGroupByLikes.mockResolvedValue([{ imageId: "picture 1", _count: { _all: 4 } }]);

  const result = await getEventPictures();

  expect(mockFindManyLikes).not.toHaveBeenCalled();
  expect(result).toEqual([{ ...expectedPicture, likes: 4, likedByMe: false }]);
});

/* - Testando o resultado - */

test("should return an empty list when there are no pictures", async () => {
  const result = await getEventPictures();

  expect(result).toEqual([]);
});

test("should return the picture with the tag of the event and the dates as strings", async () => {
  mockFindManyPictures.mockResolvedValue([buildDatabasePicture()]);

  const result = await getEventPictures();

  expect(result).toEqual([expectedPicture]);
});

test("should return zero likes when the picture has no likes", async () => {
  mockFindManyPictures.mockResolvedValue([buildDatabasePicture()]);
  mockGroupByLikes.mockResolvedValue([]);

  const result = await getEventPictures();

  expect(result[0].likes).toBe(0);
});

test("should return the likes count of each picture", async () => {
  mockFindManyPictures.mockResolvedValue([
    buildDatabasePicture({ id: "picture 1" }),
    buildDatabasePicture({ id: "picture 2" }),
    buildDatabasePicture({ id: "picture 3" }),
  ]);
  mockGroupByLikes.mockResolvedValue([
    { imageId: "picture 1", _count: { _all: 7 } },
    { imageId: "picture 3", _count: { _all: 2 } },
  ]);

  const result = await getEventPictures();

  expect(result.map((picture) => picture.likes)).toEqual([7, 0, 2]);
});

test("should mark as liked by me only the pictures that the user in the session liked", async () => {
  mockFindManyPictures.mockResolvedValue([
    buildDatabasePicture({ id: "picture 1" }),
    buildDatabasePicture({ id: "picture 2" }),
    buildDatabasePicture({ id: "picture 3" }),
  ]);
  mockFindManyLikes.mockResolvedValue([
    { userId: "user 1", imageId: "picture 2" },
    { userId: "user 1", imageId: "picture 3" },
  ]);

  const result = await getEventPictures();

  expect(result.map((picture) => picture.likedByMe)).toEqual([false, true, true]);
});

test("should return every picture in the same order as the database", async () => {
  mockFindManyPictures.mockResolvedValue([
    buildDatabasePicture({ id: "picture 1", title: "Foto A" }),
    buildDatabasePicture({ id: "picture 2", title: "Foto B" }),
    buildDatabasePicture({ id: "picture 3", title: "Foto C" }),
  ]);

  const result = await getEventPictures();

  expect(result.map((picture) => picture.id)).toEqual(["picture 1", "picture 2", "picture 3"]);
});

/* - Testando as falhas - */

test.each([
  ["looking for the pictures", () => mockFindManyPictures],
  ["counting the likes", () => mockGroupByLikes],
  ["looking for the likes of the user", () => mockFindManyLikes],
])("should throw an error when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  await expect(getEventPictures()).rejects.toThrow("Erro ao buscar fotos da galeria.");
});

test("should let the error through when validating the session throws", async () => {
  mockValidateSession.mockRejectedValue(new Error("session error"));

  await expect(getEventPictures()).rejects.toThrow("session error");
  expect(mockFindManyPictures).not.toHaveBeenCalled();
});
