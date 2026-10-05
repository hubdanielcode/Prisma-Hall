"use client";

import { roleBadgeLabels, roleBadgeStyles, tierBadgeLabels, tierBadgeStyles, useUserContext } from "@/features/users";
import { useMobileContext } from "@/shared/hooks";
import { masks } from "@/shared/utils";
import { motion } from "motion/react";
import { FaMedal, FaPencilAlt, FaTrashAlt, FaTrophy } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { UserAvatar } from "./UserAvatar";
import { UsersTablePagination } from "./UsersTablePagination";

interface UsersManagementTableProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

const UsersManagementTable = ({ currentPage, onPageChange }: UsersManagementTableProps) => {
  /* - Puxando do context - */

  const { filteredUsers, setUserBeingEdited, setUserBeingDeleted } = useUserContext();
  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Definições - */

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startingIndex = (currentPage - 1) * itemsPerPage;
  const endingIndex = currentPage * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startingIndex, endingIndex);

  /* - Visão mobile portrait: cards - */

  if (isPortraitMobile) {
    return (
      <div className="flex flex-col gap-4">
        {/* - Lista de usuários em cards - */}

        <div className="flex flex-col gap-3 text-white">
          {paginatedUsers.map((user) => {
            const roleBadge = roleBadgeStyles[user.role];
            const isValidated = user.validatedAt !== null;
            const hasNoBadges = !user.verifiedBadge && user.frequentUser === "none" && user.oldUser === "none";

            return (
              <motion.div
                key={user.id}
                className="flex flex-col gap-3 p-3 bg-black border border-[#B8860B] rounded-lg"
              >
                {/* - Usuários - */}

                <div className="flex gap-3">
                  <UserAvatar
                    user={user}
                    className="h-14 w-14"
                  />

                  <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
                    <span className="text-white font-bold text-sm leading-tight truncate">{masks.name(user.name)}</span>

                    <span className="text-white/50 text-xs leading-snug truncate">{masks.email(user.email)}</span>

                    {/* - Papel - */}

                    <div
                      className={`flex justify-center items-center px-2 py-1 w-fit backdrop-blur-sm border rounded-full mt-2 ${roleBadge.background} ${roleBadge.border}`}
                    >
                      <span className={`flex justify-center items-center text-xs font-semibold uppercase ${roleBadge.text}`}>
                        {roleBadgeLabels[user.role]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* - Selos - */}

                <div className="flex flex-wrap justify-start gap-1.5">
                  {hasNoBadges && <span className="text-white/40 text-xs font-semibold">Sem selos</span>}

                  {user.verifiedBadge && (
                    <MdVerified
                      className="h-6 w-6 text-[#B8860B]"
                      title="Verificado"
                    />
                  )}

                  {user.frequentUser !== "none" && (
                    <FaTrophy
                      className={`h-6 w-6 ${tierBadgeStyles[user.frequentUser].tableIconColor}`}
                      title={`Frequencia em eventos: ${tierBadgeLabels[user.frequentUser]}`}
                    />
                  )}

                  {user.oldUser !== "none" && (
                    <FaMedal
                      className={`h-6 w-6 ${tierBadgeStyles[user.oldUser].tableIconColor}`}
                      title={`Tempo de conta: ${tierBadgeLabels[user.oldUser]}`}
                    />
                  )}
                </div>

                {/* - Status, criado em e ações - */}

                <div className="flex items-center justify-between pt-2 border-t border-[#B8860B30]">
                  <div className="flex flex-col gap-1">
                    {/* - Status - */}

                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isValidated
                            ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                            : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                        }`}
                      />
                      <span className="text-white text-xs font-semibold">{isValidated ? "Validado" : "Não validado"}</span>
                    </div>

                    {/* - Criado em - */}

                    <span className="text-[#B8860B] font-semibold text-xs">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>

                  {/* - Ações - */}

                  <div className="flex items-center gap-2">
                    <motion.button
                      className="group flex justify-center items-center h-9 w-9 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserBeingEdited(user)}
                    >
                      <FaPencilAlt className="group-hover:text-blue-400 text-xs" />
                    </motion.button>

                    <motion.button
                      className="group flex justify-center items-center h-9 w-9 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserBeingDeleted(user)}
                    >
                      <FaTrashAlt className="group-hover:text-red-400 text-xs" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* - Paginação - */}

        <UsersTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* - Container geral - */}

      <div className="w-full border border-[#B8860B] rounded-lg overflow-x-auto">
        <motion.table className="w-full min-w-270 table-fixed">
          <colgroup>
            <col className="w-[27%]" />
            <col className="w-[12%]" />
            <col className="w-[21%]" />
            <col className="w-[13%]" />
            <col className="w-[10%]" />
            <col className="w-[17%]" />
          </colgroup>

          {/* - Cabeçalho da tabela - */}

          <thead className={`bg-[#0A0A0A] text-[#B8860B] tracking-wider uppercase ${isLandscapeMobile ? "text-xs" : "text-sm"}`}>
            <tr className={`border-b border-[#B6880660] ${isLandscapeMobile ? "h-16" : "h-20"}`}>
              <th className={`text-center rounded-tl-lg ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Usuários</th>

              <th className={`text-center ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Papel</th>

              <th className={`text-center ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Selos</th>

              <th className={`text-center ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Status</th>

              <th className={`text-center ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Criado Em</th>

              <th className={`text-center rounded-tr-lg ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Ações</th>
            </tr>
          </thead>

          {/* - Corpo da tabela - */}

          <tbody className="bg-black text-white tracking-wider">
            {paginatedUsers.map((user, index) => {
              const isLast = index === paginatedUsers.length - 1;
              const roleBadge = roleBadgeStyles[user.role];
              const isValidated = user.validatedAt !== null;
              const hasNoBadges = !user.verifiedBadge && user.frequentUser === "none" && user.oldUser === "none";

              return (
                <tr
                  className="border-b border-[#333]"
                  key={user.id}
                >
                  {/* - Usuários - */}

                  <td className={`${isLast ? "rounded-bl-lg" : ""}`}>
                    <div className={`flex items-center gap-3 ${isLandscapeMobile ? "p-2" : "p-3"}`}>
                      <UserAvatar
                        user={user}
                        className={`${isLandscapeMobile ? "h-10 w-10 ml-2" : "h-12 w-12 ml-4"}`}
                      />

                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-sm leading-tight truncate">{masks.name(user.name)}</span>

                        <span className="text-white/60 text-xs leading-tight truncate">{masks.email(user.email)}</span>
                      </div>
                    </div>
                  </td>

                  {/* - Papel - */}

                  <td>
                    <div
                      className={`flex items-center justify-center mx-auto backdrop-blur-sm border rounded-full ${
                        isLandscapeMobile ? "w-24" : "w-32"
                      } ${roleBadge.background} ${roleBadge.border}`}
                    >
                      <span
                        className={`flex items-center justify-center font-semibold uppercase ${
                          isLandscapeMobile ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-xs"
                        } ${roleBadge.text}`}
                      >
                        {roleBadgeLabels[user.role]}
                      </span>
                    </div>
                  </td>

                  {/* - Selos - */}

                  <td className="px-2 text-center">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {hasNoBadges && <span className="text-white/40 text-xs font-semibold">Sem selos</span>}

                      {user.verifiedBadge && (
                        <MdVerified
                          className="h-6 w-6 text-[#B8860B]"
                          title="Verificado"
                        />
                      )}

                      {user.frequentUser !== "none" && (
                        <FaTrophy
                          className={`h-6 w-6 ${tierBadgeStyles[user.frequentUser].tableIconColor}`}
                          title={`Frequencia em eventos: ${tierBadgeLabels[user.frequentUser]}`}
                        />
                      )}

                      {user.oldUser !== "none" && (
                        <FaMedal
                          className={`h-6 w-6 ${tierBadgeStyles[user.oldUser].tableIconColor}`}
                          title={`Tempo de conta: ${tierBadgeLabels[user.oldUser]}`}
                        />
                      )}
                    </div>
                  </td>

                  {/* - Status - */}

                  <td>
                    <div className="flex justify-center items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          isValidated
                            ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                            : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                        }`}
                      />
                      <span>{isValidated ? "Validado" : "Não validado"}</span>
                    </div>
                  </td>

                  {/* - Criado em - */}

                  <td className="text-center font-semibold">
                    <span className={`text-[#B8860B] ${isLandscapeMobile ? "pl-2" : "pl-4"}`}>
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}{" "}
                    </span>
                  </td>

                  {/* - Ações - */}

                  <td className={`text-center ${isLast ? "rounded-br-lg" : ""}`}>
                    <div className={`flex justify-center ${isLandscapeMobile ? "gap-4" : "gap-8"}`}>
                      {/* - Botão de editar - */}

                      <motion.button
                        className={`group flex justify-center items-center bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer ${
                          isLandscapeMobile ? "h-8 w-8" : "h-10 w-10"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setUserBeingEdited(user)}
                      >
                        <span>
                          <FaPencilAlt className="group-hover:text-blue-400" />
                        </span>
                      </motion.button>

                      {/* - Botão de deletar - */}

                      <motion.button
                        className={`group flex justify-center items-center bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer ${
                          isLandscapeMobile ? "h-8 w-8" : "h-10 w-10"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setUserBeingDeleted(user)}
                      >
                        <span>
                          <FaTrashAlt className="group-hover:text-red-400" />
                        </span>
                      </motion.button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </motion.table>
      </div>

      {/* - Paginação - */}

      <UsersTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export { UsersManagementTable };
