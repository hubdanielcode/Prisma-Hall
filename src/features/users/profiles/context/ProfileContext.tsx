"use client";

import { createContext } from "react";
import { updateProfileSchema } from "@/lib/validations";
import { useProfile } from "../hooks/useProfile";
import { z } from "zod";
import type { ProfileProps } from "@/features/authentication/types/profile";

interface ProfileContextType {
  /* - Dados do perfil - */

  profile: ProfileProps | false | undefined;
  isLoading: boolean;
  error: Error | null;

  /* - Mutations - */

  updateProfileMutation: (newProfileData: z.infer<typeof updateProfileSchema>) => Promise<unknown>;
  deleteProfileMutation: () => Promise<unknown>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile, isLoading, error, updateProfileMutation, deleteProfileMutation } = useProfile();

  return (
    <ProfileContext.Provider
      value={{
        /* - Dados do perfil - */

        profile,
        isLoading,
        error,

        /* - Mutations - */

        updateProfileMutation,
        deleteProfileMutation,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export { ProfileContext, ProfileProvider };
