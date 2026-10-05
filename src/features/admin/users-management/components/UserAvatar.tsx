"use client";

import { UserProps } from "@/features/users/user/types/user";

interface UserAvatarProps {
  user: Pick<UserProps, "name" | "profilePicture">;
  className?: string;
}

const UserAvatar = ({ user, className = "h-12 w-12" }: UserAvatarProps) => {
  /* - Definições - */

  const initial = user.name.trim().charAt(0).toUpperCase();

  /* - Com foto de perfil - */

  if (user.profilePicture) {
    return (
      <img
        className={`object-cover border border-[#B8860B] rounded-full shrink-0 ${className}`}
        src={user.profilePicture}
        alt={user.name}
      />
    );
  }

  /* - Sem foto de perfil: inicial do nome - */

  return (
    <div className={`flex justify-center items-center bg-[#3D2B0A] border border-[#B8860B] rounded-full shrink-0 ${className}`}>
      <span className="text-[#B8860B] font-bold">{initial}</span>
    </div>
  );
};

export { UserAvatar };
