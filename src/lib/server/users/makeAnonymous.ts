import "server-only";
import { del } from "@vercel/blob";
import { hash } from "../services/bcrypt";
import { prisma } from "../services/prisma";
import { expireStripeCheckoutSessions } from "../payments/expireStripeCheckoutSessions";
import { randomUUID } from "crypto";
import { userIdSchema } from "@/lib/validations/users/userIdSchema";
import { validateSession } from "@/actions/authentication/validateSession";
import z from "zod";

const makeAnonymous = async (userId: z.infer<typeof userIdSchema>) => {
  const parsedUserId = userIdSchema.safeParse(userId);

  if (!parsedUserId.success) {
    return false;
  }

  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: parsedUserId.data },
      select: { profilePicture: true, role: true },
    });

    if (!userToDelete) {
      return false;
    }

    /* - O último administrador não pode ser excluído, senão o site fica sem ninguém para administrá-lo - */

    if (userToDelete.role === "admin") {
      const otherAdmins = await prisma.user.count({
        where: { role: "admin", id: { not: parsedUserId.data } },
      });

      if (otherAdmins === 0) {
        return "last_admin";
      }
    }

    /* - Bloqueando a exclusão enquanto houver ingresso(s) de evento(s) futuro(s) e/ou voucher(s) pago(s) que ainda não foram retirado(s), para ninguém perder dinheiro sem reembolso - */

    const activeTicket = await prisma.ticket.findFirst({
      where: {
        userId: parsedUserId.data,
        status: "active",
        event: { startsAt: { gt: new Date() } },
        order: { ticketPayments: { some: { status: "confirmed" } } },
      },
      select: { id: true },
    });

    const activeVoucher = await prisma.voucher.findFirst({
      where: {
        userId: parsedUserId.data,
        status: "active",
        order: { voucherPayments: { some: { status: "confirmed", pickedUpAt: null } } },
      },
      select: { id: true },
    });

    if (activeTicket || activeVoucher) {
      return "active_orders";
    }

    /* - Como o pedido pendente ainda não foi pago, ele é cancelado em vez de bloquear a exclusão. Antes de cancelar, as sessões abertas do Stripe são expiradas, porque um pagamento que entrasse depois do cancelamento seria cobrado sem pedido - */

    // 1. Buscando os pedidos pendentes do usuário

    const pendingTicketOrders = await prisma.ticketOrder.findMany({
      where: { userId: parsedUserId.data, status: "pending" },
      include: { ticketPayments: true, tickets: true },
    });

    const pendingVoucherOrders = await prisma.voucherOrder.findMany({
      where: { userId: parsedUserId.data, status: "pending" },
      include: { voucherPayments: true, vouchers: true },
    });

    // 2. Expirando as sessões abertas do Stripe. Se alguma sessão já foi paga, o pagamento está entrando e a exclusão fica bloqueada até ele ser confirmado

    const pendingStripePayments = [
      ...pendingTicketOrders.flatMap((order) => order.ticketPayments),
      ...pendingVoucherOrders.flatMap((order) => order.voucherPayments),
    ].filter((payment) => payment.status === "pending" && payment.method !== "cash");

    for (const payment of pendingStripePayments) {
      const expiredSessions = await expireStripeCheckoutSessions(payment.id, payment.createdAt);

      if (!expiredSessions) {
        return "active_orders";
      }
    }

    // 3. Cancelando os pedidos pendentes. Expirar a sessão do Stripe dispara o webhook, que também cancela o pedido não pago. Qualquer outro status significa que ele foi pago no meio do caminho: nada é alterado e a exclusão falha, podendo ser repetida (agora o pedido pago bloqueia)

    await prisma.$transaction(async (transaction) => {
      for (const order of pendingTicketOrders) {
        const cancelledOrder = await transaction.ticketOrder.updateMany({
          where: { id: order.id, status: "pending" },
          data: { status: "cancelled" },
        });

        if (cancelledOrder.count === 0) {
          const currentOrder = await transaction.ticketOrder.findUnique({ where: { id: order.id }, select: { status: true } });

          if (currentOrder?.status !== "cancelled") {
            throw new Error("O pedido de ingressos deixou de estar pendente");
          }
        }

        await transaction.ticketPayment.updateMany({ where: { orderId: order.id, status: "pending" }, data: { status: "cancelled" } });
        await transaction.ticket.updateMany({ where: { orderId: order.id, status: "active" }, data: { status: "cancelled" } });
      }

      for (const order of pendingVoucherOrders) {
        const cancelledOrder = await transaction.voucherOrder.updateMany({
          where: { id: order.id, status: "pending" },
          data: { status: "cancelled" },
        });

        /* - Se o webhook já cancelou o pedido, ele também já devolveu o estoque, então aqui não devolve de novo - */

        if (cancelledOrder.count === 0) {
          const currentOrder = await transaction.voucherOrder.findUnique({ where: { id: order.id }, select: { status: true } });

          if (currentOrder?.status !== "cancelled") {
            throw new Error("O pedido de vouchers deixou de estar pendente");
          }

          continue;
        }

        await transaction.voucherPayment.updateMany({ where: { orderId: order.id, status: "pending" }, data: { status: "cancelled" } });

        /* - Devolve ao estoque o que foi reservado no checkout - */

        for (const voucher of order.vouchers) {
          await transaction.product.update({ where: { id: voucher.productId }, data: { quantity: { increment: voucher.quantity } } });
        }
      }
    });

    /* - Ao deletar o usuário, os dados pessoais e de uso dele são apagados e a conta é anonimizada. Pedidos, pagamentos, ingressos e vouchers continuam no banco, sem nenhum dado pessoal - */

    // 1. Gerando uma senha aleatória que ninguém conhece, para ninguém conseguir entrar na conta anonimizada

    const anonymizedPassword = await hash(randomUUID(), 10);

    // 2. Buscando a galeria do usuário, para apagar as curtidas e as imagens dela

    const userGalleries = await prisma.gallery.findMany({
      where: { userId: parsedUserId.data },
      select: { id: true, image: true },
    });

    const userGalleryIds = userGalleries.map((gallery) => gallery.id);

    // 3. Buscando os eventos que o usuário avaliou, para recalcular a nota deles depois que as avaliações forem apagadas

    const userReviews = await prisma.review.findMany({
      where: { userId: parsedUserId.data },
      select: { eventId: true },
      distinct: ["eventId"],
    });

    const reviewedEventIds = userReviews.map((review) => review.eventId);

    await prisma.$transaction([
      // 4. Apagando a galeria e as curtidas

      prisma.galleryLikes.deleteMany({ where: { imageId: { in: userGalleryIds } } }),
      prisma.gallery.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.galleryLikes.deleteMany({ where: { userId: parsedUserId.data } }),

      // 5. Apagando favoritos, avaliações e carrinho

      prisma.favoriteEvent.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.review.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.cart.deleteMany({ where: { userId: parsedUserId.data } }),

      // 6. Apagando notificações, preferências e newsletter

      prisma.notification.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.notificationPreference.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.newsletter.deleteMany({ where: { userId: parsedUserId.data } }),

      // 7. Apagando as sessões e o perfil (CPF, endereço, telefone)

      prisma.session.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.profile.deleteMany({ where: { userId: parsedUserId.data } }),

      // 8. Anonimizando o usuário em vez de apagá-lo, para manter o histórico financeiro e os analytics

      prisma.user.update({
        where: { id: parsedUserId.data },
        data: {
          name: "Usuário removido",
          email: `removido-${parsedUserId.data}@prismahall.invalid`,
          password: anonymizedPassword,
          token: null,
          tokenExpiresAt: null,
          profilePicture: null,
          role: "user",
          verifiedBadge: false,
          frequentUser: "none",
          oldUser: "none",
          validatedAt: null,
        },
      }),
    ]);

    // 9. Recalculando a nota dos eventos que o usuário avaliou, já sem as avaliações dele. Evento sem nenhuma avaliação volta para 0. A conta continua anonimizada mesmo sem o recálculo

    try {
      const remainingRatings = await prisma.review.groupBy({
        by: ["eventId"],
        where: { eventId: { in: reviewedEventIds } },
        _avg: { rating: true },
      });

      for (const eventId of reviewedEventIds) {
        const remainingRating = remainingRatings.find((item) => item.eventId === eventId);
        const averageRating = remainingRating?._avg.rating ? Math.round(remainingRating._avg.rating.toNumber() * 100) / 100 : 0;

        await prisma.event.update({ where: { id: eventId }, data: { rating: averageRating } });
      }
    } catch (error) {
      console.error("[makeAnonymous] Falha ao recalcular a nota dos eventos:", error);
    }

    // 10. Removendo a foto de perfil e as imagens da galeria do Blob. A conta continua anonimizada mesmo sem a remoção

    const blobUrls = [...userGalleries.map((gallery) => gallery.image), userToDelete.profilePicture].filter((url): url is string => Boolean(url));

    if (blobUrls.length > 0) {
      try {
        await del(blobUrls);
      } catch {
        // As imagens ficam no Blob, mas a conta já foi anonimizada
      }
    }

    return true;
  } catch {
    return false;
  }
};

export { makeAnonymous };
