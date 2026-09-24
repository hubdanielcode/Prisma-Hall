"use client";

import { AnimatePresence, motion } from "motion/react";
import { CustomTextInput } from "@/shared/components/ui/CustomTextInput";
import { FaCalendarAlt, FaCity, FaHome, FaIdCard, FaMapMarkerAlt, FaPhone, FaSortNumericUp, FaUser } from "react-icons/fa";
import { masks } from "@/shared/utils/functions/masks";
import { MdApartment, MdMyLocation } from "react-icons/md";
import { useBlockScroll } from "@/shared/hooks/useBlockScroll";
import { useEffect, useRef, useState } from "react";
import { useProfileContext } from "../hooks/useProfileContext";
import { X } from "lucide-react";

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal = ({ onClose, isOpen }: EditProfileModalProps) => {
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

  /* - Estados de erro - */

  const [profileSubmitError, setProfileSubmitError] = useState<string>("");

  /* - Definições - */

  const profileSubmitRef = useRef<HTMLDivElement | null>(null);

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Preenche os campos com os dados originais do perfil no momento em que o mmodal abre

  useEffect(() => {
    if (!profile || !isOpen) {
      return;
    }

    setName(profile.name);
    setPhoneNumber(profile.phoneNumber ?? "");
    setSocialSecurityNumber(profile.socialSecurityNumber ?? "");
    setBirthDate(profile.birthDate?.toLocaleDateString("pt-BR") ?? "");
    setZipCode(profile.zipCode ?? "");
    setCity(profile.city ?? "");
    setState(profile.state ?? "");
    setNeighborhood(profile.neighborhood ?? "");
    setStreet(profile.street ?? "");
    setNumber(profile.number ?? "");
    setComplement(profile.complement ?? "");
    setProfileSubmitError("");
  }, [isOpen, profile]);

  // 3. Salva os dados digitados e fecha o modal

  const handleSaveInfo = async () => {
    setProfileSubmitError("");

    const rawProfile = {
      name,
      phoneNumber: phoneNumber ?? "",
      socialSecurityNumber: socialSecurityNumber ?? undefined,
      birthDate: birthDate ?? undefined,
      zipCode: zipCode ?? undefined,
      city: city ?? undefined,
      state: state ?? undefined,
      neighborhood: neighborhood ?? undefined,
      street: street ?? undefined,
      number: number ?? undefined,
      complement: complement ?? undefined,
    };

    const updatedProfile = await updateProfileMutation(rawProfile);

    if (!updatedProfile) {
      setProfileSubmitError("Não foi possível salvar as alterações.");

      return;
    }

    onClose();
  };

  // 4. Limpa os valores digitados e fecha o modal

  const handleClearInfo = () => {
    setName("");
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
    onClose();
  };

  // 5. Fecha o erro ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside = !profileSubmitRef.current || profileSubmitRef.current.contains(e.target as Node);

      if (clickedInside) {
        return;
      }

      setProfileSubmitError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/90 backdrop:blur-sm flex items-center justify-center z-50">
            <div className="flex justify-center w-full md:w-[65%] max-h-[90vh] overflow-y-auto mx-auto mt-3 bg-black border border-[#B8860B] rounded-lg sm:mt-44 mb-2">
              {/* - Card principal - */}

              <div className="flex flex-col w-full p-6 gap-2">
                {/* - Título - */}

                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mx-auto">Editar Informações</span>

                  {/* - Botão de fechar - */}

                  <motion.button
                    className="h-fit p-2 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B] rounded-full cursor-pointer hover:shadow-xs shadow-[#B8860B]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                  >
                    <X className="text-white h-5 w-5" />
                  </motion.button>
                </div>

                {/* - Linha 1: Nome - */}

                <CustomTextInput
                  label="Nome do Comprador"
                  icon={<FaUser />}
                  placeholder="Nome Completo"
                  value={name}
                  onChange={(value) => setName(masks.name(value as string))}
                  maxLength={50}
                />

                {/* - Linha 2: Telefone, socialSecurityNumber e data de nascimento - */}

                <div className="flex flex-col md:flex-row w-full gap-4">
                  {/* - Input de telefone - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="Telefone"
                      icon={<FaPhone />}
                      placeholder="(00) 00000-0000"
                      value={profile ? (profile.phoneNumber ?? "") : ""}
                      onChange={(value) => setPhoneNumber(masks.phoneNumber(value as string))}
                      maxLength={15}
                    />
                  </div>

                  {/* - Input de CPF - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="socialSecurityNumber"
                      icon={<FaIdCard />}
                      placeholder="000.000.000-00"
                      value={profile ? (profile.socialSecurityNumber ?? "") : ""}
                      onChange={(value) => setSocialSecurityNumber(masks.socialSecurityNumber(value as string))}
                      maxLength={14}
                    />
                  </div>

                  {/* - Input de data de nascimento - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="Data de Nascimento"
                      placeholder="DD/MM/AAAA"
                      value={profile ? (profile.birthDate?.toLocaleDateString("pt-BR") ?? "") : ""}
                      onChange={(value) => setBirthDate(masks.birthDate(value as string))}
                      icon={<FaCalendarAlt />}
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* - Linha 3: CEP, cidade/state e bairro - */}

                <div className="flex flex-col md:flex-row w-full gap-4">
                  {/* - Input de CEP - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="zipCode"
                      icon={<MdMyLocation />}
                      placeholder="00000-000"
                      value={profile ? (profile.zipCode ?? "") : ""}
                      onChange={(value) => setZipCode(masks.zipCode(value as string))}
                      maxLength={9}
                    />
                  </div>

                  {/* - Input de cidade/UF - */}

                  <div className="flex-1">
                    <div className="flex flex-col justify-around">
                      <span className="text-sm text-white/60 font-semibold mb-1 mt-2 md:mb-2 md:mt-4">Cidade / state</span>

                      <div className="flex bg-[#1A1A1A] w-full rounded-lg px-4 py-2">
                        <FaCity className="text-[#B8860B] mr-2 my-auto" />

                        <input
                          className="flex justify-between bg-transparent outline-none font-normal text-white/60 placeholder:text-white/40 mr-auto w-full"
                          placeholder="Cidade"
                          value={profile ? (profile.city ?? "") : ""}
                          onChange={(e) => setCity(masks.city(e.target.value))}
                          maxLength={50}
                        />

                        <span className="bg-transparent outline-none text-sm text-white/40 w-5 ml-auto">/</span>

                        <input
                          className="flex justify-between bg-transparent w-12 outline-none font-normal text-white/60 placeholder:text-white/40"
                          placeholder="state"
                          value={profile ? (profile.state ?? "") : ""}
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
                      value={profile ? (profile.neighborhood ?? "") : ""}
                      onChange={(value) => setNeighborhood(masks.neighborhood(value as string))}
                      icon={<FaMapMarkerAlt />}
                      maxLength={60}
                    />
                  </div>
                </div>

                {/* - Linha 4: Rua, número e complemento - */}

                <div className="flex flex-col md:flex-row w-full gap-4">
                  {/* - Input de rua - */}

                  <div className="flex-1">
                    <CustomTextInput
                      label="Rua"
                      placeholder="Nome da Rua"
                      value={profile ? (profile.street ?? "") : ""}
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
                      value={profile ? (profile.number ?? "") : ""}
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
                      value={profile ? (profile.complement ?? "") : ""}
                      onChange={(value) => setComplement(masks.complement(value as string))}
                      icon={<MdApartment />}
                      maxLength={25}
                    />
                  </div>
                </div>

                {/* - Seção de erro - */}

                <div
                  className="min-h-20 w-full mt-8"
                  ref={profileSubmitRef}
                >
                  {profileSubmitError && (
                    <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                      {profileSubmitError}
                    </p>
                  )}
                </div>

                {/* - Botões - */}

                <div className="flex justify-end w-full pb-6 gap-5">
                  <motion.button
                    // 1. Cancelar

                    className="text-white/60 hover:text-white text-sm font-semibold px-4 py-2 transition-colors rounded-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearInfo}
                  >
                    Cancelar
                  </motion.button>

                  <motion.button
                    // 2. Salvar alterações

                    className="text-white/60 hover:text-white text-sm font-semibold bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B] hover:shadow-sm hover:shadow-[#B8860B] px-4 py-2 rounded-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveInfo}
                  >
                    Salvar Alterações
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

export { EditProfileModal };
