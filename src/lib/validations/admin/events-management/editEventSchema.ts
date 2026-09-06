import { z } from "zod";
import { createEventSchema } from "./createEventSchema";
import { atLeastOneFieldUpdated } from "../../../../shared/utils/atLeastOneFieldUpdated";

const editEventSchema = createEventSchema
  .partial()
  .extend({ eventId: z.uuid() })
  .refine(
    (event) => {
      const { eventId, ...eventWithoutId } = event;

      return atLeastOneFieldUpdated(eventWithoutId);
    },

    { message: "Para validar a edição, altere pelo menos um dos campos." },
  );

export { editEventSchema };
