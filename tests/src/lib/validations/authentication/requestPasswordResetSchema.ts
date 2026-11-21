import z from "zod";

const requestPasswordResetSchema = z.email().max(50, "Seu e-mail não deve ultrapassar um máximo de 50 caracteres.");

export { requestPasswordResetSchema };
