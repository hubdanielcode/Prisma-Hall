"use client";

import { createContext, useEffect, useState } from "react";
import { editUserSchema } from "@/lib/validations/admin/user-management/editUserSchema";
import { useUsers } from "../hooks/useUsers";
import type { UserProps } from "../types/user";
import type { z } from "zod";

interface UserContextType {
  /* - Dados dos usuários (apenas a página atual) - */

  users: UserProps[];
  totalUsers: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;

  /* - Estados de paginação - */

  currentPage: number;
  setCurrentPage: (currentPage: number) => void;

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
  /* - Estados de paginação - */

  const [currentPage, setCurrentPage] = useState<number>(1);

  /* - Estados de busca - */

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  /* - Estados dos usuários - */

  const [selectedRole, setSelectedRole] = useState<"all_roles" | "user" | "admin">("all_roles");
  const [selectedStatus, setSelectedStatus] = useState<"all_status" | "validated" | "not_validated">("all_status");

  /* - Definições - */

  const itemsPerPage = 6;

  /* - Funções - */

  // 1. O input responde na hora, mas a busca só vai para o servidor depois que a pessoa para de digitar

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* - Dados dos usuários - */

  const {
    users,
    total,
    totalPages,
    isLoading,
    error,
    userBeingEdited,
    setUserBeingEdited,
    userBeingDeleted,
    setUserBeingDeleted,
    editUserMutation,
    deleteUserMutation,
  } = useUsers(currentPage, itemsPerPage, debouncedSearchQuery, selectedRole, selectedStatus);

  return (
    <UserContext.Provider
      value={{
        /* - Dados dos usuários - */

        users,
        totalUsers: total,
        totalPages,
        isLoading,
        error,

        /* - Estados de paginação - */

        currentPage,
        setCurrentPage,

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
