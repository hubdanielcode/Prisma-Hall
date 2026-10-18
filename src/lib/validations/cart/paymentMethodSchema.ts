import z from "zod";

const paymentMethodSchema = z.enum(["cash", "pix", "debitCard", "creditCard"]);

export { paymentMethodSchema };
