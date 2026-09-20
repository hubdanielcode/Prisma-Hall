import { periodSchema } from "../../shared/periodSchema";
import { tagSchema } from "../../shared/tagSchema";
import { z } from "zod";

const newVisitorsSchema = z.object({
  // 1. Período

  label: periodSchema,

  // 2. Tag do evento

  tag: tagSchema,
});

export { newVisitorsSchema };
