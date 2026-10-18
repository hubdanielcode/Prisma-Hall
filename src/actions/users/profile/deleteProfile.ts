"use server";

import { checkRateLimit, resetRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { compare, hash } from "@/lib/server/services/bcrypt";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { randomUUID } from "crypto";
import { validateSession } from "@/actions/session/validateSession";

const deleteProfile = async (password: string) => {
  /* - Validando a sessão e a senha digitada - */

  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  if (typeof password !== "string" || !password) {
    return false;
  }

  /* - Limitando as tentativas de senha, para a exclusão não servir de brecha para adivinhar a senha - */

  const rateLimit = await checkRateLimit({
    action: "deleteProfile",
    identifier: validSession.user.id,
    limit: 5,
    windowSeconds: 15 * 60,
    includeIp: false,
  });

  if (!rateLimit.allowed) {
    return "too_many_attempts";
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: validSession.user.id },
      select: { password: true, profilePicture: true },
    });

    if (!userToDelete) {
      return false;
    }

    const isValidPassword = await compare(password, userToDelete.password);

    if (!isValidPassword) {
      return "invalid_password";
    }

    await resetRateLimit("deleteProfile", validSession.user.id, false);

    /* - Bloqueando a exclusão enquanto houver ingresso(s) de evento(s) futuro(s) e/ou voucher(s) pago(s) que ainda não foram retirado(s), para ninguém perder dinheiro sem reembolso - */

    const activeTicket = await prisma.ticket.findFirst({
      where: {
        userId: validSession.user.id,
        status: "active",
        event: { startsAt: { gt: new Date() } },
        order: { ticketPayments: { some: { status: "confirmed" } } },
      },
      select: { id: true },
    });

    const activeVoucher = await prisma.voucher.findFirst({
      where: {
        userId: validSession.user.id,
        status: "active",
        order: { voucherPayments: { some: { status: "confirmed", pickedUpAt: null } } },
      },
      select: { id: true },
    });

    /* - Bloqueando também enquanto houver pedido pendente, porque o pagamento ainda pode ser confirmado depois que a conta for removida - */

    const pendingTicketOrder = await prisma.ticketOrder.findFirst({
      where: { userId: validSession.user.id, status: "pending" },
      select: { id: true },
    });

    const pendingVoucherOrder = await prisma.voucherOrder.findFirst({
      where: { userId: validSession.user.id, status: "pending" },
      select: { id: true },
    });

    if (activeTicket || activeVoucher || pendingTicketOrder || pendingVoucherOrder) {
      return "active_orders";
    }

    /* - Ao deletar o perfil, os dados pessoais e de uso do usuário são apagados e a conta é anonimizada. Pedidos, pagamentos, ingressos e vouchers continuam no banco, sem nenhum dado pessoal - */

    // 1. Buscando a galeria do usuário, para apagar as curtidas e as imagens dela

    const userGalleries = await prisma.gallery.findMany({
      where: { userId: validSession.user.id },
      select: { id: true, image: true },
    });

    // 2. Gerando uma senha aleatória que ninguém conhece, para ninguém conseguir entrar na conta anonimizada

    const anonymizedPassword = await hash(randomUUID(), 10);

    await prisma.$transaction([
      // 3. Apagando a galeria e as curtidas

      prisma.gallery.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.galleryLikes.deleteMany({ where: { userId: validSession.user.id } }),

      // 4. Apagando favoritos, avaliações e carrinho

      prisma.favoriteEvent.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.review.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.cart.deleteMany({ where: { userId: validSession.user.id } }),

      // 5. Apagando notificações, preferências e newsletter

      prisma.notification.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.notificationPreference.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.newsletter.deleteMany({ where: { userId: validSession.user.id } }),

      // 6. Apagando as sessões e o perfil (CPF, endereço, telefone)

      prisma.session.deleteMany({ where: { userId: validSession.user.id } }),
      prisma.profile.deleteMany({ where: { userId: validSession.user.id } }),

      // 7. Anonimizando o usuário em vez de apagá-lo, para manter o histórico financeiro e os analytics

      prisma.user.update({
        where: { id: validSession.user.id },
        data: {
          name: "Usuário removido",
          email: `removido-${validSession.user.id}@prismahall.invalid`,
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

    // 8. Removendo a foto de perfil e as imagens da galeria do Blob. A conta continua anonimizada mesmo sem a remoção

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

export { deleteProfile };
