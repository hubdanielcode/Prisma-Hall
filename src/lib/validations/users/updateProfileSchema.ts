import { atLeastOneFieldUpdated } from "../../../shared/utils/atLeastOneFieldUpdated";
import { profileSchema } from "./profileSchema";

const updateProfileSchema = profileSchema.partial().refine(
  (profile) => {
    return atLeastOneFieldUpdated(profile);
  },

  { message: "Para validar a edição, altere pelo menos um dos campos." },
);

export { updateProfileSchema };
