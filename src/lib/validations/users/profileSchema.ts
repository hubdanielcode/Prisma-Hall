import { z } from "zod";
import { regex } from "@/shared";

const profileSchema = z.object({
  // 1. Nome

  name: z
    .string()
    .regex(regex.name, "Digite seu nome completo.")
    .min(2, "Seu nome deve conter um mínimo de 2 caracteres.")
    .max(50, "Seu nome não deve ultrapassar um máximo de 50 caracteres."),

  // 2. Telefone

  phone: z
    .string()
    .regex(regex.phoneNumber)
    .min(15, "Digite um número de telefone válido.")
    .max(15, "Digite um número de telefone válido."),

  // 3. CPF

  cpf: z
    .string()
    .regex(regex.CPF)
    .min(14, "Digite um CPF válido.")
    .max(14, "Digite um CPF válido."),

  // 4. Data de nascimento

  birthDate: z.coerce.date(),

  // 5. CEP

  cep: z.string().regex(regex.CEP).min(9, "Digite um CEP válido.").max(9, "Digite um CEP válido."),

  // 6. Cidade

  city: z
    .string()
    .regex(regex.city)
    .min(2, "Digite o nome de uma cidade válida.")
    .max(50, "Digite o nome de uma cidade válida."),

  // 7. UF

  uf: z
    .string()
    .regex(regex.UF)
    .min(2, "Digite uma sigla válida da sua UF.")
    .max(2, "Digite uma sigla válida da sua UF."),

  // 8. Bairro

  neighborhood: z
    .string()
    .regex(regex.neighborhood)
    .min(2, "Digite o nome de um bairro válido.")
    .max(60, "Digite o nome de um bairro válido."),

  // 9. Rua

  street: z
    .string()
    .regex(regex.street)
    .min(2, "Digite o nome de uma rua válida.")
    .max(50, "Digite o nome de uma rua válida."),

  // 10.Número

  number: z
    .string()
    .regex(regex.number)
    .min(1, "Digite uma identificação válida.")
    .max(7, "Digite uma identificação válida."),

  // 11. Complemento

  complement: z
    .string()
    .regex(regex.complement)
    .min(2, "Digite um complemento válido.")
    .max(25, "Digite um complemento válido."),
});

export { profileSchema };
