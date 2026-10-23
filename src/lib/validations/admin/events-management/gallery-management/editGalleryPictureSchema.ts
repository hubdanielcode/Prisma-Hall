import { atLeastOneFieldUpdated } from "@/shared/utils/functions/atLeastOneFieldUpdated";
import { createGalleryPictureSchema } from "./createGalleryPictureSchema";
import { z } from "zod";

const editGalleryPictureSchema = createGalleryPictureSchema
  .partial()
  .extend({ pictureId: z.uuid() })
  .refine(
    (picture) => {
      const { pictureId, ...pictureWithoutId } = picture;

      return atLeastOneFieldUpdated(pictureWithoutId);
    },

    { message: "Para validar a edição, altere pelo menos um dos campos." },
  );

export { editGalleryPictureSchema };
