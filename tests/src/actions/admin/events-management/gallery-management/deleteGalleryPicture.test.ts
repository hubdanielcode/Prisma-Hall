import { beforeEach, expect, test, type Mock } from "vitest";
import { deleteGalleryPicture } from "@/actions/admin/events-management/gallery-management/deleteGalleryPicture";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockFindUnique = prisma.gallery.findUnique as unknown as Mock;
const mockDelete = prisma.gallery.delete as unknown as Mock;

/* - Funções e dados auxiliares - */

const pictureId = "550e8400-e29b-41d4-a716-446655440000";
const imageUrl = "https://blob.vercel-storage.com/1700000000000-picture.png";

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockFindUnique.mockResolvedValue({ image: imageUrl });
  mockDelete.mockResolvedValue({});
  mockDel.mockResolvedValue(undefined);
});

/* - Testando permissão e validação - */

test("should return false and skip the database and the blob when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await deleteGalleryPicture(pictureId);

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database and the blob when the input has %s", async (_description, invalidId) => {
  const result = await deleteGalleryPicture(invalidId);

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando as consultas ao banco - */

test("should look for the image of the picture to delete", async () => {
  await deleteGalleryPicture(pictureId);

  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: pictureId }, select: { image: true } });
});

test("should return false and skip the delete and the blob when the picture does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await deleteGalleryPicture(pictureId);

  expect(result).toBe(false);
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test("should delete the picture by id", async () => {
  await deleteGalleryPicture(pictureId);

  expect(mockDelete).toHaveBeenCalledWith({ where: { id: pictureId } });
});

/* - Testando o resultado - */

test("should return true and remove the image from the blob only after the picture is deleted", async () => {
  const result = await deleteGalleryPicture(pictureId);

  expect(result).toBe(true);
  expect(mockDel).toHaveBeenCalledWith(imageUrl);
  expect(mockDelete.mock.invocationCallOrder[0]).toBeLessThan(mockDel.mock.invocationCallOrder[0]);
});

test("should still return true when removing the image from the blob fails", async () => {
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await deleteGalleryPicture(pictureId);

  expect(result).toBe(true);
});

/* - Testando as falhas do banco - */

test("should return false and keep the image when deleting the picture fails", async () => {
  mockDelete.mockRejectedValue(new Error("db error"));

  const result = await deleteGalleryPicture(pictureId);

  expect(result).toBe(false);
  expect(mockDel).not.toHaveBeenCalled();
});

test("should return false and skip the delete when looking for the picture fails", async () => {
  mockFindUnique.mockRejectedValue(new Error("db error"));

  const result = await deleteGalleryPicture(pictureId);

  expect(result).toBe(false);
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});
