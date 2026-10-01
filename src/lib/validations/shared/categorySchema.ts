import { z } from "zod";

const categorySchema = z.enum(["beers", "cocktails", "drinks", "no_alcohol"]);

export { categorySchema };
