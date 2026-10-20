"use client";

import { DeleteUserModal } from "../components/DeleteUserModal";
import { EditUserModal } from "../components/EditUserModal";
import { useEffect } from "react";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { UserProvider, useUserContext } from "@/features/users/user";
import { UsersManagementCard } from "../components/UsersManagementCard";
import { UsersManagementFilter } from "../components/UsersManagementFilter";
import { UsersManagementTable } from "../components/UsersManagementTable";

const UsersManagementContent = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { totalPages, currentPage, setCurrentPage, userBeingEdited, setUserBeingEdited, userBeingDeleted, setUserBeingDeleted } = useUserContext();

  /* - Funções - */

  // 1. Garantindo que a página atual nunca passe do total de páginas, caso um item seja deletado

  useEffect(() => {
    const lastPage = Math.max(totalPages, 1);

    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [totalPages, currentPage, setCurrentPage]);

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

              <span className="text-white/60 mb-12">Gerencie papéis, selos e contas de quem frequenta a casa</span>
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
