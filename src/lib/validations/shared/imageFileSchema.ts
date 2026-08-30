import { z } from "zod";

/* - Definições - */

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

/* - Criando um produto/evento ou alterando uma imagem no momento da edição - */

const imageFileSchema = z
  .file()
  .refine(
    (file) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

      if (
        fileExtension &&
        allowedExtensions.includes(fileExtension ?? "") &&
        allowedTypes.includes(file.type)
      ) {
        return true;
      } else {
        return false;
      }
    },

    { message: "Use um arquivo PNG, JPEG ou WEBP" },
  )
  .refine(
    (file) => {
      const maxSize = 4.5 * 1024 * 1024;

      if (file.size < maxSize) {
        return true;
      } else {
        return false;
      }
    },

    { message: "O arquivo não pode ser maior que 4.5MB" },
  );

export { imageFileSchema };
