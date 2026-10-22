import { frequentEventsByTier, oldAccountYearsByTier, verifiedReviewsRequired } from "@/shared/utils/constants/achievementBadges";
import { prisma } from "../services/prisma";
import type { UserBadgeLevel } from "@/prisma/generated/prisma/enums";

// 1. Descobre o maior tier cujo limite o valor já atingiu

const getTierByValue = (value: number, tierLimits: Record<"bronze" | "silver" | "gold", number>): UserBadgeLevel => {
  if (value >= tierLimits.gold) {
    return "gold";
  }

  if (value >= tierLimits.silver) {
    return "silver";
  }

  if (value >= tierLimits.bronze) {
    return "bronze";
  }

  return "none";
};

// 2. Verificado: quantidade de eventos avaliados com nota e comentário

const getVerifiedBadge = (reviewedEventsCount: number) => reviewedEventsCount >= verifiedReviewsRequired;

// 3. Frequente: quantidade de eventos dos quais o usuário participou

const getFrequentUserBadge = (participatedEventsCount: number) => getTierByValue(participatedEventsCount, frequentEventsByTier);

// 4. Antigo: anos completos de conta (o ano só conta depois que o aniversário da conta passa)

const getOldUserBadge = (createdAt: Date, today: Date = new Date()) => {
  const yearsDifference = today.getFullYear() - createdAt.getFullYear();
  const yearPassed = today.getMonth() > createdAt.getMonth() || (today.getMonth() === createdAt.getMonth() && today.getDate() >= createdAt.getDate());
  const accountYears = yearPassed ? yearsDifference : yearsDifference - 1;

  return getTierByValue(accountYears, oldAccountYearsByTier);
};

/* - Recalcula os badges do usuário (verificado, frequente e antigo) a partir do banco e salva o resultado - */

const recalculateUserBadges = async (userId: string) => {
  try {
    /* - Usuário - */

    const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } });

    if (!existingUser) {
      return false;
    }

    /* - Avaliações e participações - */

    const [reviews, tickets] = await Promise.all([
      // 1. Só avaliações com comentário contam pro badge (nota sozinha não conta)

      prisma.review.findMany({
        where: { userId, comment: { not: null } },
        select: { eventId: true, comment: true },
      }),

      // 2. Participou = ingresso ativo (não cancelado), pedido confirmado e evento que já aconteceu (e não foi cancelado)

      prisma.ticket.findMany({
        where: {
          userId,
          status: "active",
          order: { status: "confirmed" },
          event: { isCancelled: false, startsAt: { lt: new Date() } },
        },
        select: { eventId: true },
        distinct: ["eventId"],
      }),
    ]);

    // 3. Comentário só com espaços não conta, e várias avaliações no mesmo evento contam como uma

    const reviewedEventIds = new Set(reviews.filter((review) => review.comment && review.comment.trim().length > 0).map((review) => review.eventId));

    /* - Badges calculados - */

    const userBadges = {
      verifiedBadge: getVerifiedBadge(reviewedEventIds.size),
      frequentUser: getFrequentUserBadge(tickets.length),
      oldUser: getOldUserBadge(existingUser.createdAt),
    };

    await prisma.user.update({ where: { id: userId }, data: userBadges });

    return userBadges;
  } catch {
    return false;
  }
};

/* - Recalcula só o badge de tempo de conta de todos os usuários. Roda periodicamente, porque o tempo passa mesmo que o usuário não faça nenhuma ação - */

const recalculateOldUserBadges = async () => {
  try {
    // 1. Usuários anonimizados ficam de fora, o badge deles é sempre "none"

    const existingUsers = await prisma.user.findMany({
      where: { email: { not: { endsWith: "@prismahall.invalid" } } },
      select: { id: true, createdAt: true, oldUser: true },
    });

    // 2. Separa por tier só quem mudou, assim o banco não escreve em quem já está certo

    const today = new Date();

    const userIdsByLevel: Record<UserBadgeLevel, string[]> = { none: [], bronze: [], silver: [], gold: [] };

    for (const existingUser of existingUsers) {
      const oldUserBadge = getOldUserBadge(existingUser.createdAt, today);

      if (oldUserBadge !== existingUser.oldUser) {
        userIdsByLevel[oldUserBadge].push(existingUser.id);
      }
    }

    // 3. Uma atualização por tier, todas na mesma transação

    const levelsToUpdate = (Object.keys(userIdsByLevel) as UserBadgeLevel[]).filter((level) => userIdsByLevel[level].length > 0);

    await prisma.$transaction(
      levelsToUpdate.map((level) => prisma.user.updateMany({ where: { id: { in: userIdsByLevel[level] } }, data: { oldUser: level } })),
    );

    return true;
  } catch {
    return false;
  }
};

export { recalculateOldUserBadges, recalculateUserBadges };
