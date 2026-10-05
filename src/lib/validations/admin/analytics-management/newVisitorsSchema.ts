import { periodSchema } from "../../shared/periodSchema";
import { tagFilterSchema } from "../../shared/tagSchemas";
import { z } from "zod";

const newVisitorsSchema = z.object({
  // 1. Período

  label: periodSchema,

  // 2. Tag do evento

  tag: tagFilterSchema,
});

export { newVisitorsSchema };
