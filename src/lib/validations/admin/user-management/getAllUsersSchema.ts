import { z } from "zod";

const getAllUsersSchema = z.object({
  // 1. Página

  currentPage: z.number().int().min(1),

  // 2. Itens por página

  itemsPerPage: z.number().int().min(1).max(50),

  // 3. Busca por nome ou e-mail

  searchQuery: z.string().trim().max(100, "A busca está muito longa."),

  // 4. Role

  selectedRole: z.enum(["all_roles", "user", "admin"]),

  // 5. Status

  selectedStatus: z.enum(["all_status", "validated", "not_validated"]),
});

export { getAllUsersSchema };
