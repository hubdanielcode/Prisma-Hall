"use server";

import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { updateProfileSchema } from "@/lib/validations/users/updateProfileSchema";
import { validateSession } from "@/actions/session/validateSession";
import z from "zod";

const updateProfile = async (profile: z.input<typeof updateProfileSchema>) => {
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

      const editedProfile = await prisma.profile.upsert({
        where: { userId: validSession.user.id },
        update: { ...baseProfileData },
        create: {
          userId: validSession.user.id,
          phoneNumber: parsedUpdate.data.phoneNumber ?? "",
          socialSecurityNumber: parsedUpdate.data.socialSecurityNumber ?? "",
          birthDate: parsedUpdate.data.birthDate ?? new Date(),
          zipCode: parsedUpdate.data.zipCode ?? "",
          city: parsedUpdate.data.city ?? "",
          state: parsedUpdate.data.state ?? "",
          neighborhood: parsedUpdate.data.neighborhood ?? "",
          street: parsedUpdate.data.street ?? "",
          number: parsedUpdate.data.number ?? "",
          complement: parsedUpdate.data.complement ?? "",
        },
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

    const editedProfile = await prisma.profile.upsert({
      where: { userId: validSession.user.id },
      update: { ...baseProfileData },
      create: {
        userId: validSession.user.id,
        phoneNumber: parsedUpdate.data.phoneNumber ?? "",
        socialSecurityNumber: parsedUpdate.data.socialSecurityNumber ?? "",
        birthDate: parsedUpdate.data.birthDate ?? new Date(),
        zipCode: parsedUpdate.data.zipCode ?? "",
        city: parsedUpdate.data.city ?? "",
        state: parsedUpdate.data.state ?? "",
        neighborhood: parsedUpdate.data.neighborhood ?? "",
        street: parsedUpdate.data.street ?? "",
        number: parsedUpdate.data.number ?? "",
        complement: parsedUpdate.data.complement ?? "",
      },
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
  } catch (error) {
    console.error(error);
    return false;
  }
};

export { updateProfile };
