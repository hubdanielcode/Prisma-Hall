import {
  FaCalendarAlt,
  FaCity,
  FaHome,
  FaIdCard,
  FaMapMarkerAlt,
  FaPhone,
  FaSortNumericUp,
  FaUser,
} from "react-icons/fa";
import { MdApartment } from "react-icons/md";
import { motion } from "framer-motion";
import { masks } from "@/shared";
import { useAuthenticationContext } from "@/features/authentication";
import { useProfileContext } from "../hooks/useProfileContext";
import { supabase } from "../../../../../supabase/supabase";
import { CustomTextInput } from "@/shared/index";

export interface FirstTimeProfileModalProps {
  onClose: () => void;
}

const FirstTimeProfileModal = ({ onClose }: FirstTimeProfileModalProps) => {
  /* - Puxando do context - */

  const { fullName, setFullName, phoneNumber, setPhoneNumber } =
    useAuthenticationContext();

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

  /* - Funções - */

  // 1. Salva os dados digitados e fecha o modal

  const handleSaveInfo = async () => {
    await supabase.auth.updateUser({
      data: {
        phoneNumber,
        CPF,
        birthDate,
        city,
        UF,
        neighborhood,
        street,
        number,
        complement,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop:blur-sm flex items-center justify-center z-50 overflow-hidden">
      <div className="flex w-full md:w-[65%] max-h-[90vh] sm:max-h-[90vh] overflow-y-auto mx-auto mt-7 bg-black border border-[#B8860B] rounded-lg">
        {/* - Card principal - */}

        <div className="flex flex-col w-full p-6 gap-2">
          {/* - Título - */}

          <div className="flex flex-col mb-2">
            <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mx-auto">
              Bem Vindo!
            </span>

            {/* - Subtítulo - */}

            <span className="text-white/40 text-sm mx-auto mt-2">
              Falta pouco para completar o seu perfil!
            </span>
          </div>

          {/* - Linha 1: Nome e telefone - */}

          <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
            <div className="flex-1">
              {/* - Input de nome - */}

              <CustomTextInput
                label="Nome do Comprador"
                icon={<FaUser />}
                placeholder="Nome Completo"
                value={fullName}
                onChange={(value) =>
                  setFullName(masks.fullName(value as string))
                }
                maxLength={50}
              />
            </div>

            {/* - Input de telefone - */}

            <div className="flex-1">
              <CustomTextInput
                label="Telefone"
                icon={<FaPhone />}
                placeholder="(00) 00000-0000"
                value={phoneNumber}
                onChange={(value) =>
                  setPhoneNumber(masks.phoneNumber(value as string))
                }
                maxLength={15}
              />
            </div>
          </div>

          {/* - Linha 2: CPF e data de nascimento - */}

          <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
            <div className="flex-1">
              {/* - Input de CPF - */}

              <CustomTextInput
                label="CPF"
                icon={<FaIdCard />}
                placeholder="000.000.000-00"
                value={CPF}
                onChange={(value) => setCPF(masks.CPF(value as string))}
                maxLength={14}
              />
            </div>

            {/* - Input de data de nascimento - */}

            <div className="flex-1">
              <CustomTextInput
                label="Data de Nascimento"
                placeholder="DD/MM/AAAA"
                value={birthDate}
                onChange={(value) =>
                  setBirthDate(masks.birthDate(value as string))
                }
                icon={<FaCalendarAlt />}
                maxLength={10}
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
                    className="flex justify-between bg-transparent outline-none font-normal text-white/60 placeholder:text-white/40 mr-auto w-full"
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => setCity(masks.city(e.target.value))}
                    maxLength={50}
                  />

                  <span className="bg-transparent outline-none text-white/40 w-5 ml-auto">
                    /
                  </span>

                  <input
                    className="flex justify-between bg-transparent w-12 outline-none font-normal text-white/60 placeholder:text-white/40"
                    placeholder="UF"
                    value={UF}
                    onChange={(e) => setUF(masks.UF(e.target.value))}
                    maxLength={2}
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
                onChange={(value) =>
                  setNeighborhood(masks.neighborhood(value as string))
                }
                icon={<FaMapMarkerAlt />}
                maxLength={60}
              />
            </div>
          </div>

          {/* - Linha 4: Rua, número e complemento - */}

          <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
            <div className="flex-1">
              {/* - Input de rua - */}

              <CustomTextInput
                label="Rua"
                placeholder="Nome da Rua"
                value={street}
                onChange={(value) => setStreet(masks.street(value as string))}
                icon={<FaHome />}
                maxLength={50}
              />
            </div>

            {/* - Input de número - */}

            <div className="flex-1">
              <CustomTextInput
                label="Número"
                placeholder="Número da Casa ou Prédio"
                value={number}
                onChange={(value) => setNumber(masks.number(value as string))}
                icon={<FaSortNumericUp />}
                maxLength={4}
              />
            </div>

            {/* - Input de complemento - */}

            <div className="flex-1">
              <CustomTextInput
                label="Complemento"
                placeholder="Apto, Bloco..."
                value={complement}
                onChange={(value) =>
                  setComplement(masks.complement(value as string))
                }
                icon={<MdApartment />}
                maxLength={25}
              />
            </div>
          </div>

          {/* - Botão - */}

          <div className="flex justify-end w-full py-6">
            {/* - Salvar - */}

            <motion.button
              className="bg-[#1A1A1A] hover:bg-[#333] px-4 py-2 border border-[#B8860B] hover:shadow-sm hover:shadow-[#B8860B] rounded-lg cursor-pointer mr-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveInfo}
            >
              Salvar e Continuar
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { FirstTimeProfileModal };
