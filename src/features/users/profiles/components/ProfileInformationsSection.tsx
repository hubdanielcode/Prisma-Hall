import { useAuthenticationContext } from "@/features/authentication";
import { useState, useEffect } from "react";
import { MdAlternateEmail, MdApartment } from "react-icons/md";
import { motion } from "framer-motion";
import {
  FaUser,
  FaLock,
  FaIdCard,
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaHome,
  FaSortNumericUp,
} from "react-icons/fa";
import { CustomTextInput } from "@/shared/index";
import { ProfileEditModal } from "@/features/users/profiles/components/ProfileEditModal";
import { FirstTimeProfileModal } from "./FirstTimeProfileModal";
import { supabase } from "../../../../../supabase/supabase";
import { useProfileContext } from "../hooks/useProfileContext";

const ProfileInformationsSection = () => {
  /* - Puxando do context - */

  const {
    fullName,
    setFullName,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
  } = useAuthenticationContext();

  const {
    CPF,
    setCPF,
    birthDate,
    setBirthDate,
    city,
    setCity,
    UF,
    setUF,
    neighborhood,
    setNeighborhood,
    street,
    setStreet,
    number,
    setNumber,
    complement,
    setComplement,
  } = useProfileContext();

  /* - Estados dos modais - */

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] =
    useState<boolean>(false);

  /* - Funções - */

  // 1. Faz o scroll da página voltar para o topo no momento da renderização

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Busca os dados do usuário logado no Supabase ao montar o componente

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setFullName(user.user_metadata.fullName ?? "");
        setEmail(user.email ?? "");
        setPhoneNumber(user.user_metadata.phoneNumber ?? "");
        setCPF(user.user_metadata.CPF ?? "");
        setBirthDate(user.user_metadata.birthDate ?? "");
        setCity(user.user_metadata.city ?? "");
        setUF(user.user_metadata.UF ?? "");
        setNeighborhood(user.user_metadata.neighborhood ?? "");
        setStreet(user.user_metadata.street ?? "");
        setNumber(user.user_metadata.number ?? "");
        setComplement(user.user_metadata.complement ?? "");

        if (
          !user.user_metadata.phoneNumber ||
          !user.user_metadata.CPF ||
          !user.user_metadata.birthDate ||
          !user.user_metadata.city ||
          !user.user_metadata.UF ||
          !user.user_metadata.neighborhood ||
          !user.user_metadata.street ||
          !user.user_metadata.number ||
          !user.user_metadata.complement
        ) {
          setIsFirstTimeModalOpen(true);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen max-w-full pt-32 px-4 sm:px-6 md:px-0">
      {/* - Título principal - */}

      <div className="flex justify-center items-center rounded-lg h-fit w-full">
        <span className="relative text-white font-semibold text-2xl sm:text-3xl md:text-4xl mb-4">
          Minhas Informações
        </span>
      </div>

      {/* - Card principal - */}

      <div className="flex flex-col sm:flex-col md:flex-row justify-between w-full md:w-[65%] h-fit mx-auto mb-2 sm:mt-8 md:mt-4.5 bg-black border border-[#B6880B] rounded-lg">
        {/* - Coluna Esquerda: Dados da conta - */}

        <div className="flex flex-col border-b sm:border-b md:border-b-0 md:border-r border-[#B6880B60] w-full md:w-[35%] p-6 gap-2">
          {/* - Título da coluna - */}

          <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mb-3">
            Dados da Conta
          </span>

          {/* - Input de nome - */}

          <CustomTextInput
            label="Seu Nome"
            icon={<FaUser />}
            placeholder="Nome Completo"
            value={fullName}
            maxLength={50}
            readOnly
          />

          {/* - Input de email - */}

          <CustomTextInput
            label="Seu Email"
            icon={<MdAlternateEmail />}
            placeholder="exemplo@email.com"
            value={email}
            maxLength={50}
            readOnly
          />

          {/* - Input de senha - */}

          <CustomTextInput
            type="password"
            label="Sua Senha"
            icon={<FaLock />}
            placeholder="•••••••"
            value="•••••••"
            maxLength={50}
            readOnly
          />

          {/* - Input de telefone - */}

          <CustomTextInput
            label="Telefone"
            icon={<FaPhone />}
            placeholder="(00) 00000-0000"
            value={phoneNumber}
            maxLength={15}
            readOnly
          />
        </div>

        {/* - Coluna Direita: Dados do comprador - */}

        <div className="flex flex-col w-full p-6 gap-2">
          {/* - Título da coluna - */}

          <div className="flex justify-between items-center">
            <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mb-2">
              Dados do Comprador
            </span>

            {/* - Botão - */}

            <motion.button
              className="flex justify-center items-center px-4 py-2 text-white bg-[#1A1A1A] border border-[#B6880B] rounded-lg cursor-pointer hover:shadow-xs shadow-[#B6880B]"
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
            value={fullName}
            maxLength={50}
            readOnly
          />

          {/* - Linha 2: CPF e data de nascimento - */}

          <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
            <div className="flex-1">
              {/* - Input de CPF - */}

              <CustomTextInput
                label="CPF"
                icon={<FaIdCard />}
                placeholder="000.000.000-00"
                value={CPF}
                maxLength={14}
                readOnly
              />
            </div>

            {/* - Input de data de nascimento - */}

            <div className="flex-1">
              <CustomTextInput
                label="Data de Nascimento"
                placeholder="DD/MM/AAAA"
                value={birthDate}
                icon={<FaCalendarAlt />}
                maxLength={10}
                readOnly
              />
            </div>
          </div>

          {/* - Linha 3: Cidade/UF e bairro - */}

          <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
            <div className="flex-1">
              {/* - Input de Cidade/UF - */}

              <div className="flex flex-col justify-around">
                <span className="text-xs text-white/60 font-semibold mb-1 mt-2 md:mb-2 md:mt-4 uppercase">
                  Cidade / UF
                </span>

                <div className="flex bg-[#1A1A1A] w-full rounded-lg px-4 py-2">
                  <FaCity className="text-[#B8860B] mr-2 my-auto" />

                  <input
                    className="flex justify-between bg-transparent outline-none text-sm font-normal text-white/60 placeholder:text-white/40 mr-auto"
                    placeholder="Cidade"
                    value={city}
                    maxLength={50}
                    readOnly
                  />

                  <span className="bg-transparent outline-none text-white/40 w-5 ml-auto">
                    /
                  </span>

                  <input
                    className="flex justify-between bg-transparent w-12 outline-none text-sm font-normal text-white/60 placeholder:text-white/40"
                    placeholder="UF"
                    value={UF}
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
                value={neighborhood}
                icon={<FaMapMarkerAlt />}
                maxLength={60}
                readOnly
              />
            </div>
          </div>

          {/* - Linha 4: Rua, complemento e número - */}

          <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
            <div className="flex-1">
              {/* - Input de rua - */}

              <CustomTextInput
                label="Rua"
                placeholder="Nome da Rua"
                value={street}
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
                value={number}
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
                value={complement}
                icon={<MdApartment />}
                maxLength={25}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* - Modal de edição de informações - */}

      {isModalOpen && (
        <ProfileEditModal onClose={() => setIsModalOpen(false)} />
      )}

      {/* - Modal de primeira vez - */}

      {isFirstTimeModalOpen && (
        <FirstTimeProfileModal onClose={() => setIsFirstTimeModalOpen(false)} />
      )}
    </div>
  );
};

export { ProfileInformationsSection };
