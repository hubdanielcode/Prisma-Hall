import z from "zod";

const badgeLevelSchema = z.enum(["none", "bronze", "silver", "gold"]);

export { badgeLevelSchema };
