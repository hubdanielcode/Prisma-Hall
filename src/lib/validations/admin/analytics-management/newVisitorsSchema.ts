import { z } from "zod";
import { periodSchema } from "../../shared/periodSchema";
import { tagSchema } from "../../shared/tagSchema";

const newVisitorsSchema = z.object({
  // 1. Período

  label: periodSchema,

  // 2. Tag do evento

  tag: tagSchema,
});

export { newVisitorsSchema };
