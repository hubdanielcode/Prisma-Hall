import "server-only";
import type { EventStatus } from "@/prisma/generated/prisma/enums";

/* - Calcula o status do evento a partir da data; evento cancelado continua cancelado - */

interface EventStatusSourceProps {
  isCancelled: boolean;
  startsAt: Date;
}

const getEventStatus = ({ isCancelled, startsAt }: EventStatusSourceProps): EventStatus => {
  if (isCancelled) {
    return "cancelled";
  }

  return startsAt.getTime() > Date.now() ? "soon" : "happened";
};

export { getEventStatus };
