"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/actions/session/validateSession";
import type { ProfileProps } from "@/features/authentication/types/profile";

const getProfile = async (): Promise<ProfileProps | false> => {
  const validSession = await validateSession();

  if (!validSession) {
    return false;
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: validSession.user.id },
      select: {
        name: true,
        profilePicture: true,
        role: true,
        verifiedBadge: true,
        createdAt: true,
        validatedAt: true,
        updatedAt: true,
      },
    });

    if (!userData) {
      return false;
    }

    const profileData = await prisma.profile.findUnique({
      where: { userId: validSession.user.id },
      select: {
        phoneNumber: true,
        socialSecurityNumber: true,
        birthDate: true,
        zipCode: true,
        city: true,
        state: true,
        neighborhood: true,
        street: true,
        number: true,
        complement: true,
      },
    });

    return { ...userData, ...profileData };
  } catch {
    return false;
  }
};

export { getProfile };
