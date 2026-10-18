"use server";

import { checkIsAdmin } from "../checkIsAdmin";
import { del } from "@vercel/blob";
import { hash } from "@/lib/server/services/bcrypt";
import { prisma } from "@/lib/server/services/prisma";
import { randomUUID } from "crypto";
import z from "zod";

const deleteUser = async (userId: string) => {
  /* - Validando o admin e o id do usuário - */

  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return false;
  }

  const parsedUserId = z.uuid().safeParse(userId);

  if (!parsedUserId.success) {
    return false;
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: parsedUserId.data },
      select: { profilePicture: true },
    });

    if (!userToDelete) {
      return false;
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

    /* - Bloqueando também enquanto houver pedido pendente, porque o pagamento ainda pode ser confirmado depois que a conta for removida - */

    const pendingTicketOrder = await prisma.ticketOrder.findFirst({
      where: { userId: parsedUserId.data, status: "pending" },
      select: { id: true },
    });

    const pendingVoucherOrder = await prisma.voucherOrder.findFirst({
      where: { userId: parsedUserId.data, status: "pending" },
      select: { id: true },
    });

    if (activeTicket || activeVoucher || pendingTicketOrder || pendingVoucherOrder) {
      return "active_orders";
    }

    /* - Ao deletar o usuário, os dados pessoais e de uso dele são apagados e a conta é anonimizada. Pedidos, pagamentos, ingressos e vouchers continuam no banco, sem nenhum dado pessoal - */

    // 1. Buscando a galeria do usuário, para apagar as curtidas e as imagens dela

    const userGalleries = await prisma.gallery.findMany({
      where: { userId: parsedUserId.data },
      select: { id: true, image: true },
    });

    const userGalleryIds = userGalleries.map((gallery) => gallery.id);

    // 2. Gerando uma senha aleatória que ninguém conhece, para ninguém conseguir entrar na conta anonimizada

    const anonymizedPassword = await hash(randomUUID(), 10);

    await prisma.$transaction([
      // 3. Apagando a galeria e as curtidas

      prisma.galleryLikes.deleteMany({ where: { imageId: { in: userGalleryIds } } }),
      prisma.gallery.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.galleryLikes.deleteMany({ where: { userId: parsedUserId.data } }),

      // 4. Apagando favoritos, avaliações e carrinho

      prisma.favoriteEvent.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.review.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.cart.deleteMany({ where: { userId: parsedUserId.data } }),

      // 5. Apagando notificações, preferências e newsletter

      prisma.notification.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.notificationPreference.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.newsletter.deleteMany({ where: { userId: parsedUserId.data } }),

      // 6. Apagando as sessões e o perfil (CPF, endereço, telefone)

      prisma.session.deleteMany({ where: { userId: parsedUserId.data } }),
      prisma.profile.deleteMany({ where: { userId: parsedUserId.data } }),

      // 7. Anonimizando o usuário em vez de apagá-lo, para manter o histórico financeiro e os analytics

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

export { deleteUser };
