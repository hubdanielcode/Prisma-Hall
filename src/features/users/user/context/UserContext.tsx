"use client";

import { createContext, useState } from "react";
import { editUserSchema } from "@/lib/validations";
import { useUsers } from "../hooks/useUsers";
import type { UserProps } from "../types/user";
import type { z } from "zod";

interface UserContextType {
  /* - Dados dos usuários - */

  filteredUsers: UserProps[];
  isLoading: boolean;
  error: Error | null;

  /* - Estados de busca - */

  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;

  /* - Estados dos usuários - */

  userBeingEdited: UserProps | null;
  setUserBeingEdited: (userBeingEdited: UserProps | null) => void;

  userBeingDeleted: UserProps | null;
  setUserBeingDeleted: (userBeingDeleted: UserProps | null) => void;

  selectedRole: "all_roles" | "user" | "admin";
  setSelectedRole: (selectedRole: "all_roles" | "user" | "admin") => void;

  selectedStatus: "all_status" | "validated" | "not_validated";
  setSelectedStatus: (selectedStatus: "all_status" | "validated" | "not_validated") => void;

  /* - Mutations - */

  editUserMutation: (user: z.infer<typeof editUserSchema>) => Promise<unknown>;
  deleteUserMutation: (userId: string) => Promise<unknown>;
}

const UserContext = createContext<UserContextType | null>(null);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Dados dos usuários - */

  const {
    users,
    isLoading,
    error,
    userBeingEdited,
    setUserBeingEdited,
    userBeingDeleted,
    setUserBeingDeleted,
    editUserMutation,
    deleteUserMutation,
  } = useUsers();

  /* - Estados de busca - */

  const [searchQuery, setSearchQuery] = useState("");

  /* - Estados dos usuários - */

  const [selectedRole, setSelectedRole] = useState<"all_roles" | "user" | "admin">("all_roles");
  const [selectedStatus, setSelectedStatus] = useState<"all_status" | "validated" | "not_validated">("all_status");

  /* - Definições - */

  const filteredUsers =
    users?.filter((user) => {
      const matchingSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchingRoles = selectedRole === "all_roles" || user.role === selectedRole;
      const matchingStatus =
        selectedStatus === "all_status" || (selectedStatus === "validated" ? user.validatedAt !== null : user.validatedAt === null);

      return matchingSearch && matchingRoles && matchingStatus;
    }) ?? [];

  return (
    <UserContext.Provider
      value={{
        /* - Dados dos usuários - */

        filteredUsers,
        isLoading,
        error,

        /* - Estados de busca - */

        searchQuery,
        setSearchQuery,

        /* - Estados dos usuários - */

        userBeingEdited,
        setUserBeingEdited,

        userBeingDeleted,
        setUserBeingDeleted,

        selectedRole,
        setSelectedRole,

        selectedStatus,
        setSelectedStatus,

        /* - Mutations - */

        editUserMutation,
        deleteUserMutation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
