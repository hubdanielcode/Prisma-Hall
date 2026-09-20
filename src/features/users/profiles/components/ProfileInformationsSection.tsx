"use client";

import { CustomTextInput } from "@/shared/components/ui/CustomTextInput";
import { EditProfileModal } from "@/features/users/profiles/components/EditProfileModal";
import { FaUser, FaIdCard, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaCity, FaHome, FaSortNumericUp } from "react-icons/fa";
import { FirstTimeProfileModal } from "./FirstTimeProfileModal";
import { MdAlternateEmail, MdApartment, MdMyLocation } from "react-icons/md";
import { motion } from "motion/react";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useProfileContext } from "../hooks/useProfileContext";
import { useState, useEffect } from "react";

const ProfileInformationsSection = () => {
  /* - Puxando do context - */

  const { user } = useAuthenticationContext();
  const { profile, isLoading } = useProfileContext();

  /* - Estados dos modais - */

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState<boolean>(false);

  /* - Funções - */

  // 1. Faz o scroll da página voltar para o topo no momento da renderização

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Abre o modal de primeira vez se algum dado do perfil ainda não foi preenchido

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (
      !profile ||
      !profile.phoneNumber ||
      !profile.socialSecurityNumber ||
      !profile.birthDate ||
      !profile.zipCode ||
      !profile.city ||
      !profile.state ||
      !profile.neighborhood ||
      !profile.street ||
      !profile.number ||
      !profile.complement
    ) {
      setIsFirstTimeModalOpen(true);
    }
  }, [isLoading, profile]);

  return (
    <div className="relative flex flex-col min-h-screen max-w-full pt-32 px-4 sm:px-6 md:px-0">
      {/* - Título principal - */}

      <div className="flex justify-center items-center rounded-lg h-fit w-full">
        <span className="relative text-white font-semibold text-2xl sm:text-3xl md:text-4xl mb-4">Minhas Informações</span>
      </div>

      {/* - Card principal - */}

      <div className="flex flex-col sm:flex-col md:flex-row justify-between w-full md:w-[65%] h-fit mx-auto mb-2 sm:mt-8 md:mt-4.5 bg-black border border-[#B8860B] rounded-lg">
        {/* - Coluna Esquerda: Dados da conta - */}

        <div className="flex flex-col border-b sm:border-b md:border-b-0 md:border-r border-[#B8860B60] w-full md:w-[35%] p-6 gap-2 truncate">
          {/* - Título da coluna - */}

          <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mb-3">Dados da Conta</span>

          <div className="flex flex-col">
            <span className="text-white font-semibold text-lg truncate">{(user?.name ?? "").split(" ").slice(0, 2).join(" ")}</span>

            {profile && profile.validatedAt && (
              <p className="text-[#B8860B] text-sm">Membro desde {profile.validatedAt.toLocaleDateString("pt-BR")}</p>
            )}
          </div>

          {/* - Input de email - */}

          <CustomTextInput
            className="[&_input]:min-w-0 [&_input]:truncate"
            label="Seu Email"
            icon={<MdAlternateEmail />}
            placeholder="exemplo@email.com"
            value={user?.email ?? ""}
            maxLength={50}
            readOnly
          />
        </div>

        {/* - Coluna Direita: Dados do comprador - */}

        <div className="flex flex-col w-full p-6 gap-2">
          {/* - Título da coluna - */}

          <div className="flex justify-between items-center">
            <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mb-2">Dados do Comprador</span>

            {/* - Botão - */}

            <motion.button
              className="flex justify-center items-center px-4 py-2 text-white bg-[#1A1A1A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-xs shadow-[#B8860B]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
            >
              Editar Dados
            </motion.button>
          </div>

          {/* - Linha 1: Nome do comprador - */}

          <CustomTextInput
            label="Nome do Comprador"
            icon={<FaUser />}
            placeholder="Nome Completo"
            value={user?.name ?? ""}
            maxLength={50}
            readOnly
          />

          {/* - Linha 2: Telefone, CPF e data de nascimento - */}

          <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
            {/* - Input de telefone - */}

            <div className="flex-1">
              <CustomTextInput
                label="Telefone"
                icon={<FaPhone />}
                placeholder="(00) 00000-0000"
                value={profile ? (profile?.phoneNumber ?? "") : ""}
                maxLength={15}
                readOnly
              />
            </div>

            {/* - Input de CPF - */}

            <div className="flex-1">
              <CustomTextInput
                label="CPF"
                icon={<FaIdCard />}
                placeholder="000.000.000-00"
                value={profile ? (profile?.socialSecurityNumber ?? "") : ""}
                maxLength={14}
                readOnly
              />
            </div>

            {/* - Input de data de nascimento - */}

            <div className="flex-1">
              <CustomTextInput
                label="Data de Nascimento"
                placeholder="DD/MM/AAAA"
                value={profile ? (profile.birthDate?.toLocaleDateString("pt-BR") ?? "") : ""}
                icon={<FaCalendarAlt />}
                maxLength={10}
                readOnly
              />
            </div>
          </div>

          {/* - Linha 3: CEP, cidade/UF e bairro - */}

          <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
            {/* - Input de CEP - */}

            <div className="flex-1">
              <CustomTextInput
                label="CEP"
                icon={<MdMyLocation />}
                placeholder="00000-000"
                value={profile ? (profile?.zipCode ?? "") : ""}
                maxLength={9}
                readOnly
              />
            </div>

            {/* - Input de Cidade/UF - */}

            <div className="flex-1">
              <div className="flex flex-col justify-around">
                <span className="text-sm text-white/60 font-semibold mb-1 mt-2 md:mb-2 md:mt-4">Cidade / UF</span>

                <div className="flex bg-[#1A1A1A] w-full rounded-lg px-4 py-2">
                  <FaCity className="text-[#B8860B] mr-2 my-auto" />

                  <input
                    className="flex justify-between bg-transparent outline-none text-sm font-normal text-white/60 placeholder:text-white/40 mr-auto"
                    placeholder="Cidade"
                    value={profile ? (profile?.city ?? "") : ""}
                    maxLength={50}
                    readOnly
                  />

                  <span className="bg-transparent outline-none text-sm text-white/40 w-5 ml-auto">/</span>

                  <input
                    className="flex justify-between bg-transparent w-12 outline-none text-sm font-normal text-white/60 placeholder:text-white/40"
                    placeholder="UF"
                    value={profile ? (profile?.state ?? "") : ""}
                    maxLength={2}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* - Input de bairro - */}

            <div className="flex-1">
              <CustomTextInput
                label="Bairro"
                placeholder="Nome do Bairro"
                value={profile ? (profile?.neighborhood ?? "") : ""}
                icon={<FaMapMarkerAlt />}
                maxLength={60}
                readOnly
              />
            </div>
          </div>

          {/* - Linha 4: Rua, complemento e número - */}

          <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
            {/* - Input de rua - */}

            <div className="flex-1">
              <CustomTextInput
                label="Rua"
                placeholder="Nome da Rua"
                value={profile ? (profile?.street ?? "") : ""}
                icon={<FaHome />}
                maxLength={50}
                readOnly
              />
            </div>

            {/* - Input de número - */}

            <div className="flex-1">
              <CustomTextInput
                label="Número"
                placeholder="Número da Casa ou Prédio"
                value={profile ? (profile?.number ?? "") : ""}
                icon={<FaSortNumericUp />}
                maxLength={4}
                readOnly
              />
            </div>

            {/* - Input de complemento - */}

            <div className="flex-1">
              <CustomTextInput
                label="Complemento"
                placeholder="Apto, Bloco..."
                value={profile ? (profile?.complement ?? "") : ""}
                icon={<MdApartment />}
                maxLength={25}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* - Modal de edição de informações - */}

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* - Modal de primeira vez - */}

      <FirstTimeProfileModal
        isOpen={isFirstTimeModalOpen}
        onClose={() => setIsFirstTimeModalOpen(false)}
      />
    </div>
  );
};

export { ProfileInformationsSection };
