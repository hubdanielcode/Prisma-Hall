import "server-only";
import type { EventStatus } from "@/prisma/generated/prisma/enums";

/* - Calcula o status do evento a partir da data; evento cancelado continua cancelado - */

interface EventStatusProps {
  isCancelled: boolean;
  startsAt: Date;
}

const getEventStatus = ({ isCancelled, startsAt }: EventStatusProps): EventStatus => {
  if (isCancelled) {
    return "cancelled";
  }

  return startsAt.getTime() > Date.now() ? "soon" : "happened";
};

export { getEventStatus };
