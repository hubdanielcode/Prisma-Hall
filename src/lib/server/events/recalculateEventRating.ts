import { prisma } from "../services/prisma";

/* - Recalcula a nota média do evento a partir de todas as avaliações dele e salva no banco - */

const recalculateEventRating = async (eventId: string) => {
  try {
    const reviewsAggregate = await prisma.review.aggregate({
      where: { eventId: eventId },
      _avg: { rating: true },
    });

    // 1. Sem avaliações, a nota do evento volta para 0

    const newEventRating = reviewsAggregate._avg.rating ?? 0;

    await prisma.event.update({
      where: { id: eventId },
      data: { rating: newEventRating },
    });

    return true;
  } catch {
    return false;
  }
};

export { recalculateEventRating };
