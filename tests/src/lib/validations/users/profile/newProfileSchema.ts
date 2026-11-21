import { profileSchema } from "./profileSchema";

const newProfileSchema = profileSchema.omit({ name: true, profilePicture: true });

export { newProfileSchema };
