"use server";

import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { newProfileSchema } from "@/lib/validations/users/profileSchemas";
import { updateProfileSchema } from "@/lib/validations/users/updateProfileSchema";
import { validateSession } from "@/actions/session/validateSession";
import z from "zod";

/* - Quando o perfil ainda não existe, todos os dados dele são obrigatórios (nome e foto ficam no usuário, não no perfil) - */

const updateProfile = async (profile: z.input<typeof updateProfileSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedUpdatedProfile = updateProfileSchema.safeParse(profile);

  if (!parsedUpdatedProfile.success) {
    return false;
  }

  const baseUserData = {
    name: parsedUpdatedProfile.data.name,
  };

  const baseProfileData = {
    phoneNumber: parsedUpdatedProfile.data.phoneNumber,
    socialSecurityNumber: parsedUpdatedProfile.data.socialSecurityNumber,
    birthDate: parsedUpdatedProfile.data.birthDate,
    zipCode: parsedUpdatedProfile.data.zipCode,
    city: parsedUpdatedProfile.data.city,
    state: parsedUpdatedProfile.data.state,
    neighborhood: parsedUpdatedProfile.data.neighborhood,
    street: parsedUpdatedProfile.data.street,
    number: parsedUpdatedProfile.data.number,
    complement: parsedUpdatedProfile.data.complement,
  };

  const profilePicture = parsedUpdatedProfile.data.profilePicture;
  const hasProfileData = Object.values(baseProfileData).some((value) => value !== undefined);

  let newProfilePictureUrl: string | undefined;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: validSession.user.id },
      select: { profilePicture: true },
    });

    if (!existingUser) {
      return false;
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: validSession.user.id },
    });

    /* - Sem perfil e com dados de perfil: exige todos os campos, em vez de inventar valores - */

    const parsedNewProfile = !existingProfile && hasProfileData ? newProfileSchema.safeParse(profile) : null;

    if (parsedNewProfile && !parsedNewProfile.success) {
      return false;
    }

    /* - Só sobe a imagem depois de tudo validado - */

    if (profilePicture) {
      const blob = await put(`${Date.now()}-${profilePicture.name}`, profilePicture, { access: "public" });

      newProfilePictureUrl = blob.url;
    }

    const { editedUser, editedProfile } = await prisma.$transaction(async (transaction) => {
      const editedUser = await transaction.user.update({
        where: { id: validSession.user.id },
        data: { ...baseUserData, profilePicture: newProfilePictureUrl },
      });

      let editedProfile = existingProfile;

      if (existingProfile && hasProfileData) {
        editedProfile = await transaction.profile.update({
          where: { userId: validSession.user.id },
          data: { ...baseProfileData },
        });
      }

      if (!existingProfile && parsedNewProfile?.success) {
        editedProfile = await transaction.profile.create({
          data: { userId: validSession.user.id, ...parsedNewProfile.data },
        });
      }

      return { editedUser, editedProfile };
    });

    /* - Remove a foto antiga do Blob. O perfil continua atualizado mesmo sem a remoção - */

    if (newProfilePictureUrl && existingUser.profilePicture) {
      try {
        await del(existingUser.profilePicture);
      } catch {
        // A foto antiga fica no Blob, mas a troca já foi feita
      }
    }

    return {
      name: editedUser.name,
      profilePicture: editedUser.profilePicture,

      phoneNumber: editedProfile?.phoneNumber,
      socialSecurityNumber: editedProfile?.socialSecurityNumber,
      birthDate: editedProfile?.birthDate,
      zipCode: editedProfile?.zipCode,
      city: editedProfile?.city,
      state: editedProfile?.state,
      neighborhood: editedProfile?.neighborhood,
      street: editedProfile?.street,
      number: editedProfile?.number,
      complement: editedProfile?.complement,
    };
  } catch {
    /* - Se o banco falhou depois do upload, remove a imagem nova para não ficar órfã no Blob - */

    if (newProfilePictureUrl) {
      try {
        await del(newProfilePictureUrl);
      } catch {
        // A imagem nova fica no Blob, mas nada foi salvo no banco
      }
    }

    return false;
  }
};

export { updateProfile };
