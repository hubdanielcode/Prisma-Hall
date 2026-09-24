import { imageFileSchema } from "../shared/imageFileSchema";
import { parsedDate, regex } from "@/shared/utils";
import { z } from "zod";

const profileSchema = z.object({
  // 1. Nome

  name: z
    .string()
    .regex(regex.name, "Digite seu nome completo.")
    .min(2, "Seu nome deve conter um mínimo de 2 caracteres.")
    .max(50, "Seu nome não deve ultrapassar um máximo de 50 caracteres."),

  // 2. Foto

  profilePicture: imageFileSchema,

  // 3. Telefone

  phoneNumber: z.string().regex(regex.phoneNumber).min(15, "Digite um número de telefone válido.").max(15, "Digite um número de telefone válido."),

  // 4. CPF

  socialSecurityNumber: z.string().regex(regex.socialSecurityNumber).min(14, "Digite um CPF válido.").max(14, "Digite um CPF válido."),

  // 5. Data de nascimento

  birthDate: z
    .string()
    .regex(regex.birthDate)
    .transform((birthDate: string, zodValidationContext) => {
      const parsedBirthDate = parsedDate(birthDate);

      if (isNaN(parsedBirthDate.getTime())) {
        zodValidationContext.addIssue({ code: "custom", message: "Digite uma data válida." });
        return z.NEVER;
      } else {
        return parsedBirthDate;
      }
    }),

  // 6. CEP

  zipCode: z.string().regex(regex.zipCode).min(9, "Digite um CEP válido.").max(9, "Digite um CEP válido."),

  // 7. Cidade

  city: z.string().regex(regex.city).min(2, "Digite o nome de uma cidade válida.").max(50, "Digite o nome de uma cidade válida."),

  // 8. UF

  state: z.string().regex(regex.state).min(2, "Digite uma sigla válida da sua UF.").max(2, "Digite uma sigla válida da sua UF."),

  // 9. Bairro

  neighborhood: z.string().regex(regex.neighborhood).min(2, "Digite o nome de um bairro válido.").max(40, "Digite o nome de um bairro válido."),

  // 10. Rua

  street: z.string().regex(regex.street).min(2, "Digite o nome de uma rua válida.").max(50, "Digite o nome de uma rua válida."),

  // 11.Número

  number: z.string().regex(regex.number).min(1, "Digite uma identificação válida.").max(7, "Digite uma identificação válida."),

  // 12. Complemento

  complement: z.string().regex(regex.complement).min(2, "Digite um complemento válido.").max(40, "Digite um complemento válido."),
});

export { profileSchema };
