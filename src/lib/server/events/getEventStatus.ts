import "server-only";
import type { EventStatus } from "@/prisma/generated/prisma/enums";

/* - Calcula o status do evento a partir da data; evento cancelado continua cancelado - */

interface EventStatusSourceProps {
  status: string;
  startsAt: Date;
}

const getEventStatus = ({ status, startsAt }: EventStatusSourceProps): EventStatus => {
  if (status === "cancelled") {
    return "cancelled";
  }

  return startsAt.getTime() > Date.now() ? "soon" : "happened";
};

export { getEventStatus };
