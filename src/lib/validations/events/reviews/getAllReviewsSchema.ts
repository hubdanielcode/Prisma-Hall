import { z } from "zod";

const getAllReviewsSchema = z.object({
  // 1. Página

  currentPage: z.number().int().min(1),

  // 2. Itens por página

  itemsPerPage: z.number().int().min(1).max(50),

  // 3. Evento (opcional): só as avaliações desse evento

  eventId: z.uuid().optional(),

  // 4. Usuário (opcional): só as avaliações desse usuário

  userId: z.uuid().optional(),
});

export { getAllReviewsSchema };
