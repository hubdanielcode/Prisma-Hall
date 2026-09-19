"use server";

import { validateSession } from "@/actions/session/validateSession";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";
import z from "zod";
import { put } from "@vercel/blob";

const updateProfile = async (profile: z.infer<typeof updateProfileSchema>) => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  const parsedUpdate = updateProfileSchema.safeParse(profile);

  if (!parsedUpdate.success) {
    return false;
  }

  const baseUserData = {
    name: parsedUpdate.data.name,
  };

  const baseProfileData = {
    phoneNumber: parsedUpdate.data.phoneNumber,
    socialSecurityNumber: parsedUpdate.data.socialSecurityNumber,
    birthDate: parsedUpdate.data.birthDate,
    zipCode: parsedUpdate.data.zipCode,
    city: parsedUpdate.data.city,
    state: parsedUpdate.data.state,
    neighborhood: parsedUpdate.data.neighborhood,
    street: parsedUpdate.data.street,
    number: parsedUpdate.data.number,
    complement: parsedUpdate.data.complement,
  };

  const profilePicture = parsedUpdate.data.profilePicture;

  try {
    if (profilePicture) {
      const blob = await put(`${Date.now()}-${profilePicture.name}`, profilePicture, { access: "public" });

      /* - Se houver troca de imagem - */

      const editedProfile = await prisma.profile.update({
        where: { userId: validSession.user.id },
        data: { ...baseProfileData },
      });

      const editedUser = await prisma.user.update({
        where: { id: validSession.user.id },
        data: { ...baseUserData, profilePicture: blob.url },
      });

      return {
        name: editedUser.name,
        profilePicture: editedUser.profilePicture,

        phoneNumber: editedProfile.phoneNumber,
        socialSecurityNumber: editedProfile.socialSecurityNumber,
        birthDate: editedProfile.birthDate,
        zipCode: editedProfile.zipCode,
        city: editedProfile.city,
        state: editedProfile.state,
        neighborhood: editedProfile.neighborhood,
        street: editedProfile.street,
        number: editedProfile.number,
        complement: editedProfile.complement,
      };
    }

    /* - Se não houver troca de imagem - */

    const editedProfile = await prisma.profile.update({
      where: { userId: validSession.user.id },
      data: { ...baseProfileData },
    });

    const editedUser = await prisma.user.update({
      where: { id: validSession.user.id },
      data: { ...baseUserData },
    });

    return {
      name: editedUser.name,
      profilePicture: editedUser.profilePicture,

      phoneNumber: editedProfile.phoneNumber,
      socialSecurityNumber: editedProfile.socialSecurityNumber,
      birthDate: editedProfile.birthDate,
      zipCode: editedProfile.zipCode,
      city: editedProfile.city,
      state: editedProfile.state,
      neighborhood: editedProfile.neighborhood,
      street: editedProfile.street,
      number: editedProfile.number,
      complement: editedProfile.complement,
    };
  } catch {
    return false;
  }
};

export { updateProfile };
