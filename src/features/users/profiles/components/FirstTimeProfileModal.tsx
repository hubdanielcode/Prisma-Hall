"use client";

import { AnimatePresence, motion } from "motion/react";
import { CustomTextInput } from "@/shared/components/ui/CustomTextInput";
import { FaCalendarAlt, FaCity, FaHome, FaIdCard, FaMapMarkerAlt, FaPhone, FaSortNumericUp, FaUser } from "react-icons/fa";
import { masks } from "@/shared/utils/functions/masks";
import { MdApartment, MdMyLocation } from "react-icons/md";
import { updateProfileSchema } from "@/lib/validations/users/updateProfileSchema";
import { useBlockScroll } from "@/shared/hooks/useBlockScroll";
import { useEffect, useState } from "react";
import { useProfileContext } from "../hooks/useProfileContext";

export interface FirstTimeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FirstTimeProfileModal = ({ onClose, isOpen }: FirstTimeProfileModalProps) => {
  /* - Puxando do context - */

  const { profile, updateProfileMutation } = useProfileContext();

  /* - Estados de usuário - */

  const [name, setName] = useState<string>("");

  /* - Estados de perfil - */

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [socialSecurityNumber, setSocialSecurityNumber] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [street, setStreet] = useState<string | null>(null);
  const [number, setNumber] = useState<string | null>(null);
  const [complement, setComplement] = useState<string | null>(null);

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Preenche os campos com os dados originais do perfil no momento em que o mmodal abre

  useEffect(() => {
    if (!profile || !isOpen) {
      return;
    }

    setName(profile.name);
    setPhoneNumber("");
    setSocialSecurityNumber("");
    setBirthDate("");
    setZipCode("");
    setCity("");
    setState("");
    setNeighborhood("");
    setStreet("");
    setNumber("");
    setComplement("");
  }, [isOpen, profile]);

  // 3. Salva os dados digitados e fecha o modal

  const handleSaveInfo = async () => {
    const parsedProfile = updateProfileSchema.safeParse({
      name,
      phoneNumber,
      socialSecurityNumber,
      birthDate,
      zipCode,
      city,
      state,
      neighborhood,
      street,
      number,
      complement,
    });

    if (!parsedProfile.success) {
      return;
    }

    const updatedProfile = await updateProfileMutation(parsedProfile.data);

    if (!updatedProfile) {
      return;
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/90 backdrop:blur-sm flex items-center justify-center z-50 overflow-hidden">
            <div className="flex w-full md:w-[65%] max-h-[90vh] sm:max-h-[90vh] overflow-y-auto mx-auto mt-7 bg-black border border-[#B8860B] rounded-lg">
              {/* - Card principal - */}

              <div className="flex flex-col w-full p-6 gap-2">
                {/* - Título - */}

                <div className="flex flex-col mb-2">
                  <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mx-auto">Bem Vindo!</span>

                  {/* - Subtítulo - */}

                  <span className="text-white/40 text-sm mx-auto mt-2">Falta pouco para completar o seu perfil!</span>
                </div>

                {/* - Linha 1: Nome - */}

                <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
                  <div className="flex-1">
                    <CustomTextInput
                      label="Nome do Comprador"
                      icon={<FaUser />}
                      placeholder="Nome Completo"
                      value={name}
                      onChange={(value) => setName(masks.name(value as string))}
                      maxLength={50}
                    />
                  </div>
                </div>

                {/* - Linha 2: Telefone, CPF e data de nascimento - */}

                <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
                  {/* - Input de telefone - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="Telefone"
                      icon={<FaPhone />}
                      placeholder="(00) 00000-0000"
                      value={phoneNumber ?? ""}
                      onChange={(value) => setPhoneNumber(masks.phoneNumber(value as string))}
                      maxLength={15}
                    />
                  </div>

                  {/* - Input de CPF - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="CPF"
                      icon={<FaIdCard />}
                      placeholder="000.000.000-00"
                      value={socialSecurityNumber ?? ""}
                      onChange={(value) => setSocialSecurityNumber(masks.socialSecurityNumber(value as string))}
                      maxLength={14}
                    />
                  </div>

                  {/* - Input de data de nascimento - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="Data de Nascimento"
                      placeholder="DD/MM/AAAA"
                      value={birthDate ?? ""}
                      onChange={(value) => setBirthDate(masks.birthDate(value as string))}
                      icon={<FaCalendarAlt />}
                      maxLength={10}
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
                      value={zipCode ?? ""}
                      onChange={(value) => setZipCode(masks.zipCode(value as string))}
                      maxLength={9}
                    />
                  </div>
                  {/* - Input de Cidade/UF - */}

                  <div className="flex-1">
                    <div className="flex flex-col justify-around">
                      <span className="text-sm text-white/60 font-semibold mb-1 mt-2 md:mb-2 md:mt-4">Cidade / UF</span>

                      <div className="flex bg-[#1A1A1A] w-full rounded-lg px-4 py-2">
                        <FaCity className="text-[#B8860B] mr-2 my-auto" />

                        <input
                          className="flex justify-between bg-transparent outline-none font-normal text-white/60 placeholder:text-white/40 mr-auto w-full"
                          placeholder="Cidade"
                          value={city ?? ""}
                          onChange={(e) => setCity(masks.city(e.target.value))}
                          maxLength={50}
                        />

                        <span className="bg-transparent outline-none text-sm text-white/40 w-5 ml-auto">/</span>

                        <input
                          className="flex justify-between bg-transparent w-12 outline-none font-normal text-white/60 placeholder:text-white/40"
                          placeholder="UF"
                          value={state ?? ""}
                          onChange={(e) => setState(masks.state(e.target.value))}
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
                      value={neighborhood ?? ""}
                      onChange={(value) => setNeighborhood(masks.neighborhood(value as string))}
                      icon={<FaMapMarkerAlt />}
                      maxLength={60}
                    />
                  </div>
                </div>

                {/* - Linha 4: Rua, número e complemento - */}

                <div className="flex flex-col sm:flex-row md:flex-row w-full gap-4">
                  {/* - Input de rua - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="Rua"
                      placeholder="Nome da Rua"
                      value={street ?? ""}
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
                      value={number ?? ""}
                      onChange={(value) => setNumber(masks.number(value as string))}
                      icon={<FaSortNumericUp />}
                      maxLength={7}
                    />
                  </div>

                  {/* - Input de complemento - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="Complemento"
                      placeholder="Apto, Bloco..."
                      value={complement ?? ""}
                      onChange={(value) => setComplement(masks.complement(value as string))}
                      icon={<MdApartment />}
                      maxLength={25}
                    />
                  </div>
                </div>

                {/* - Botão de salvar - */}

                <div className="flex justify-end w-full py-6">
                  <motion.button
                    className="text-white/60 hover:text-white text-sm font-semibold bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B] hover:shadow-sm hover:shadow-[#B8860B] px-4 py-2 rounded-lg cursor-pointer"
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
        </>
      )}
    </AnimatePresence>
  );
};

export { FirstTimeProfileModal };
