"use client";

import { DeleteUserModal, EditUserModal, UsersManagementCard, UsersManagementFilter, UsersManagementTable } from "@/features/admin";
import { useEffect, useState } from "react";
import { UserProvider } from "@/features/users/user/context/UserContext";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useUserContext } from "@/features/users";

const UsersManagementContent = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { filteredUsers, userBeingEdited, setUserBeingEdited, userBeingDeleted, setUserBeingDeleted } = useUserContext();

  /* - Estados de paginação - */

  const [currentPage, setCurrentPage] = useState<number>(1);

  /* - Definições - */

  const itemsPerPage = 6;

  /* - Funções - */

  // 1. Garantindo que o número de páginas seja recalculado sempre que um item for adicionado ou deletado

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(filteredUsers.length / itemsPerPage), 1);

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredUsers.length]);

  return (
    <>
      <div className={`bg-[#1A1A1A] min-h-screen w-full ${isPortraitMobile ? "pb-10" : isLandscapeMobile ? "pb-12 px-6" : "pb-14 px-8"}`}>
        <div className="flex flex-col max-w-6xl w-full mx-auto gap-6 px-4">
          <div className={`flex ${isPortraitMobile ? "flex-col" : "flex-row justify-between items-stretch gap-0"}`}>
            {/* - Título - */}

            <div className={`flex flex-col items-start ${isPortraitMobile ? "mb-4" : "mb-0"}`}>
              <span className={`text-white font-semibold mb-2 ${isPortraitMobile ? "text-lg" : isLandscapeMobile ? "text-xl" : "text-2xl"}`}>
                Gestão de Usuários
              </span>

              {/* - Subtítulo - */}

              <span className="text-white/60">Gerencie papéis, selos e contas de quem frequenta a casa</span>
            </div>
          </div>

          {/* - Cards dos usuários - */}

          <div className="flex justify-center">
            <UsersManagementCard />
          </div>

          {/* - Filtro - */}

          <UsersManagementFilter
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* - Tabela de usuários - */}

          <UsersManagementTable
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* - Modal de edição de usuários - */}

          {userBeingEdited ? (
            <EditUserModal
              isOpen={!!userBeingEdited}
              onClose={() => setUserBeingEdited(null)}
            />
          ) : null}

          {/* - Modal de deleção de usuários - */}

          {userBeingDeleted ? (
            <DeleteUserModal
              isOpen={!!userBeingDeleted}
              onClose={() => setUserBeingDeleted(null)}
              user={userBeingDeleted}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

const UsersManagement = () => {
  return (
    <UserProvider>
      <UsersManagementContent />
    </UserProvider>
  );
};

export { UsersManagement };
