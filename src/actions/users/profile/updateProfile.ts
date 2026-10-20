"use server";

import { del, put } from "@vercel/blob";
import { newProfileSchema, updateProfileSchema } from "@/lib/validations";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "../../session/validateSession";
import z from "zod";

/* - Quando o perfil ainda não existe, todos os dados dele são obrigatórios (nome e foto ficam no usuário, não no perfil) - */

const updateProfile = async (profile: z.input<typeof updateProfileSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedProfile = updateProfileSchema.safeParse(profile);

  if (!parsedProfile.success) {
    return false;
  }

  const baseUserData = {
    name: parsedProfile.data.name,
  };

  const baseProfileData = {
    phoneNumber: parsedProfile.data.phoneNumber,
    socialSecurityNumber: parsedProfile.data.socialSecurityNumber,
    birthDate: parsedProfile.data.birthDate,
    zipCode: parsedProfile.data.zipCode,
    city: parsedProfile.data.city,
    state: parsedProfile.data.state,
    neighborhood: parsedProfile.data.neighborhood,
    street: parsedProfile.data.street,
    number: parsedProfile.data.number,
    complement: parsedProfile.data.complement,
  };

  const profilePicture = parsedProfile.data.profilePicture;
  const hasProfileData = Object.values(baseProfileData).some((value) => value !== undefined);

  try {
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: validSession.user.id },
    });

    /* - Sem perfil e com dados de perfil: exige todos os campos, em vez de inventar valores - */

    const parsedNewProfile = !existingProfile && hasProfileData ? newProfileSchema.safeParse(profile) : null;

    if (parsedNewProfile && !parsedNewProfile.success) {
      return false;
    }

    /* - Primeiro salva os dados no banco. A foto só sobe depois, quando o banco já aceitou tudo - */

    const { editedUser, editedProfile } = await prisma.$transaction(async (transaction) => {
      const editedUser = await transaction.user.update({
        where: { id: validSession.user.id },
        data: { ...baseUserData },
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

    let profilePictureUrl = editedUser.profilePicture;

    /* - Troca de foto: sobe a nova, grava o endereço no usuário e só então remove a antiga - */

    if (profilePicture) {
      let newProfilePictureUrl: string | undefined;

      try {
        const blob = await put(`${Date.now()}-${profilePicture.name}`, profilePicture, { access: "public" });

        newProfilePictureUrl = blob.url;

        await prisma.user.update({
          where: { id: validSession.user.id },
          data: { profilePicture: blob.url },
        });

        profilePictureUrl = blob.url;
      } catch {
        // Os dados já foram salvos. Só a foto falhou, então remove a imagem nova (se chegou a subir) para não ficar órfã no Blob

        if (newProfilePictureUrl) {
          try {
            await del(newProfilePictureUrl);
          } catch {
            // A imagem nova fica no Blob, mas a foto do perfil não foi trocada
          }
        }

        return "picture_upload_failed";
      }

      /* - Remove a foto antiga do Blob. O perfil continua atualizado mesmo sem a remoção - */

      if (editedUser.profilePicture) {
        try {
          await del(editedUser.profilePicture);
        } catch {
          // A foto antiga fica no Blob, mas a troca já foi feita
        }
      }
    }

    return {
      name: editedUser.name,
      profilePicture: profilePictureUrl,

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
    return false;
  }
};

export { updateProfile };
