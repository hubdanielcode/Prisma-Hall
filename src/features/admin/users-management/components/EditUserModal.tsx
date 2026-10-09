"use client";

import { AnimatePresence, motion } from "motion/react";
import { editUserSchema } from "@/lib/validations";
import { roleBadgeOptions, roleBadgeStyles, tierBadgeOptions, tierBadgeStyles } from "@/shared/utils";
import { useBlockScroll, useMobileContext } from "@/shared/hooks";
import { UserAvatar } from "./UserAvatar";
import { useState } from "react";
import { useUserContext } from "@/features/users/user/hooks/useUserContext";
import { X } from "lucide-react";
import type { UserProps } from "@/features/users";
import type z from "zod";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EditableUserType = Omit<z.infer<typeof editUserSchema>, "userId">;

interface ToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

const Toggle = ({ isActive, onToggle }: ToggleProps) => {
  return (
    <button
      className={`relative w-14 h-8 rounded-full cursor-pointer transition-colors ${isActive ? "bg-[#B8860B]" : "bg-[#3A3A3A]"}`}
      type="button"
      onClick={onToggle}
    >
      <motion.div
        className="absolute top-1 h-6 w-6 bg-white rounded-full shadow-md"
        animate={{ left: isActive ? "26px" : "4px" }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
    </button>
  );
};

const EditUserModal = ({ isOpen, onClose }: EditUserModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { editUserMutation, userBeingEdited } = useUserContext();

  /* - Estados dos usuários - */

  const [role, setRole] = useState<UserProps["role"]>(userBeingEdited?.role ?? "user");
  const [verifiedUser, setVerifiedUser] = useState<boolean>(userBeingEdited?.verifiedBadge ?? false);
  const [frequentUser, setFrequentUser] = useState<UserProps["frequentUser"]>(userBeingEdited?.frequentUser ?? "none");
  const [oldUser, setOldUser] = useState<UserProps["oldUser"]>(userBeingEdited?.oldUser ?? "none");
  const [forceRevalidation, setForceRevalidation] = useState<boolean>(false);

  /* - Estados de erro - */

  const [userNoChangeError, setUserNoChangeError] = useState<string>("");
  const [userSubmitError, setUserSubmitError] = useState<string>("");

  /* - Definições - */

  const isValidated = userBeingEdited?.validatedAt !== null && userBeingEdited?.validatedAt !== undefined;

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Edita o usuário (envia só o que foi alterado)

  const handleEditUser = async () => {
    setUserNoChangeError("");
    setUserSubmitError("");

    if (!userBeingEdited) {
      return false;
    }

    const changes: EditableUserType = {};

    if (role !== userBeingEdited.role) {
      changes.roles = role;
    }

    if (verifiedUser !== userBeingEdited.verifiedBadge) {
      changes.verifiedUser = verifiedUser;
    }

    if (frequentUser !== userBeingEdited.frequentUser) {
      changes.frequentUser = frequentUser;
    }

    if (oldUser !== userBeingEdited.oldUser) {
      changes.oldUser = oldUser;
    }

    if (forceRevalidation) {
      changes.forceRevalidation = true;
    }

    const parsedChanges = editUserSchema.safeParse({ userId: userBeingEdited.id, ...changes });

    if (!parsedChanges.success) {
      setUserNoChangeError("Para validar a edição, altere pelo menos um dos campos.");
      return false;
    }

    const editedUser = await editUserMutation(parsedChanges.data);

    if (!editedUser) {
      setUserSubmitError("Não foi possível editar o usuário. Tente novamente.");
      return false;
    }

    return true;
  };

  // 3. Reseta o formulário para os valores originais do usuário

  const handleResetForm = () => {
    if (!userBeingEdited) {
      return;
    }

    setUserNoChangeError("");
    setUserSubmitError("");

    setRole(userBeingEdited.role);
    setVerifiedUser(userBeingEdited.verifiedBadge);
    setFrequentUser(userBeingEdited.frequentUser);
    setOldUser(userBeingEdited.oldUser);
    setForceRevalidation(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* - Fundo escuro - */}

          <motion.div
            className="fixed inset-0 bg-black/90 z-40 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* - Card do modal - */}

          <motion.div
            className={`fixed z-50 my-10 ${
              isPortraitMobile
                ? "top-14 left-4 w-[calc(100%-2rem)] h-fit max-w-none mx-0 max-h-[calc(100dvh-7rem)]"
                : `inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto mx-4 max-h-[calc(100dvh-7rem)] ${isLandscapeMobile ? "max-w-lg" : "max-w-xl"}`
            } bg-black border border-[#B8860B] rounded-lg overflow-hidden overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* - Cabeçalho - */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8860B60]">
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Editar Usuário</span>

              <motion.button
                className="flex justify-center items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                <X className="text-white/60 hover:text-white h-5 w-5 transition-colors" />
              </motion.button>
            </div>

            {/* - Seção do usuário (somente leitura) - */}

            {userBeingEdited && (
              <div className="flex items-center gap-4 px-5 py-4 border-b border-[#B8860B60]">
                <UserAvatar
                  user={userBeingEdited}
                  className="h-16 w-16"
                />

                <div className="flex flex-col min-w-0">
                  <span className="text-white font-bold text-sm leading-tight truncate">{userBeingEdited.name}</span>

                  <span className="text-white/60 text-xs leading-tight truncate">{userBeingEdited.email}</span>
                </div>
              </div>
            )}

            {/* - Corpo do modal - */}

            <div className="flex flex-col gap-4 px-5 py-4">
              {/* - Role - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Role</label>

                <div className="flex flex-wrap gap-2">
                  {roleBadgeOptions.map((roleOption) => {
                    const badge = roleBadgeStyles[roleOption.id];
                    const isSelected = role === roleOption.id;

                    return (
                      <motion.button
                        className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-full border cursor-pointer transition-colors ${
                          isSelected
                            ? `${badge.background} ${badge.border} ${badge.text}`
                            : "bg-transparent border-[#333] text-white/40 hover:border-white/30"
                        }`}
                        key={roleOption.id}
                        type="button"
                        onClick={() => setRole(roleOption.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {roleOption.title}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* - Selo de verificado - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Selo de Verificado</label>

                <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        verifiedUser
                          ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                          : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                      }`}
                    />
                    <span className="text-white text-sm font-semibold">{verifiedUser ? "Verificado" : "Não verificado"}</span>
                  </div>

                  <Toggle
                    isActive={verifiedUser}
                    onToggle={() => setVerifiedUser((prev) => !prev)}
                  />
                </div>
              </div>

              {/* - Selo de frequência - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Selo de Frequência</label>

                <div className="flex flex-wrap gap-2">
                  {tierBadgeOptions.map((tier) => {
                    const badge = tierBadgeStyles[tier.id];
                    const isSelected = frequentUser === tier.id;

                    return (
                      <motion.button
                        className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-full border cursor-pointer transition-colors ${
                          isSelected
                            ? `${badge.filterOptionBackground} ${badge.filterOptionText}`
                            : "bg-transparent border-[#333] text-white/40 hover:border-white/30"
                        }`}
                        key={tier.id}
                        type="button"
                        onClick={() => setFrequentUser(tier.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tier.title}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* - Selo de antiguidade - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Selo de Antiguidade</label>

                <div className="flex flex-wrap gap-2">
                  {tierBadgeOptions.map((tier) => {
                    const badge = tierBadgeStyles[tier.id];
                    const isSelected = oldUser === tier.id;

                    return (
                      <motion.button
                        className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-full border cursor-pointer transition-colors ${
                          isSelected
                            ? `${badge.filterOptionBackground} ${badge.filterOptionText}`
                            : "bg-transparent border-[#333] text-white/40 hover:border-white/30"
                        }`}
                        key={tier.id}
                        type="button"
                        onClick={() => setOldUser(tier.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tier.title}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* - Revalidação da conta - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Revalidação da Conta</label>

                <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-semibold">{forceRevalidation ? "Exigir nova validação" : "Manter como está"}</span>

                    <span className="text-white/50 text-xs">
                      {isValidated ? "A conta volta a ficar como não validada." : "Esta conta já está não validada."}
                    </span>
                  </div>

                  <Toggle
                    isActive={forceRevalidation}
                    onToggle={() => setForceRevalidation((prev) => !prev)}
                  />
                </div>
              </div>
            </div>

            {/* - Seção de erro - */}

            <div className="min-h-20 w-full px-5">
              {userNoChangeError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {userNoChangeError}
                </p>
              )}

              {userSubmitError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {userSubmitError}
                </p>
              )}
            </div>

            {/* - Ações - */}

            <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-[#B8860B60]">
              <motion.button
                className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetForm}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-[#B8860B] font-semibold bg-[#3D2B0A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-sm shadow-[#DDAE56] transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const success = await handleEditUser();

                  if (success) {
                    onClose();
                  }
                }}
              >
                Editar Usuário
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { EditUserModal };
