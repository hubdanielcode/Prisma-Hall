import { tagSchema } from "./tagSchema";
import z from "zod";

const tagFilterSchema = z.enum([...tagSchema.options, "all_tags"]);

export { tagFilterSchema };
