"use client";

import { AnimatePresence, motion } from "motion/react";
import { createEventSchema } from "@/lib/validations/admin/events-management/createEventSchema";
import { CustomDateTimePicker } from "@/shared/components/ui/CustomDateTimePicker";
import { eventTags, useAttractions, useEventContext } from "@/features/events";
import { FaCalendarAlt } from "react-icons/fa";
import { formattedDate, formattedDateToString, masks } from "@/shared/utils";
import { ImagePlus, X } from "lucide-react";
import { useBlockScroll, useMobileContext } from "@/shared/hooks";
import { useRef, useState } from "react";
import z from "zod";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EmptyEventType = Omit<z.infer<typeof createEventSchema>, "image"> & { image: File | null };

const emptyEvent: EmptyEventType = {
  title: "",
  description: "",
  tag: "rock",
  attractionName: "",
  image: null,
  status: "soon",
  price: 0,
  startsAt: "",
};

const CreateEventModal = ({ isOpen, onClose }: CreateEventModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { createEventMutation } = useEventContext();
  const { attractions, isLoading: isLoadingAttractions } = useAttractions();

  /* - Estados de evento - */

  const [eventPrice, setEventPrice] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [eventTime, setEventTime] = useState<string>("");
  const [eventImagePreview, setEventImagePreview] = useState<string>("");
  const [newEvent, setNewEvent] = useState<EmptyEventType>(emptyEvent);

  /* - Estados de erro - */

  const [eventTitleError, setEventTitleError] = useState<string>("");
  const [eventDescriptionError, setEventDescriptionError] = useState<string>("");
  const [eventTagError, setEventTagError] = useState<string>("");
  const [eventAttractionError, setEventAttractionError] = useState<string>("");
  const [eventDateError, setEventDateError] = useState<string>("");
  const [eventTimeError, setEventTimeError] = useState<string>("");
  const [eventImageError, setEventImageError] = useState<string>("");
  const [eventSubmitError, setEventSubmitError] = useState<string>("");

  /* - Estados do calendário - */

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  /* - Definições - */

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpcoming = newEvent.status === "soon";

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Permite que o admin adicione a imagem do evento que será integrado ao calendário

  const handleAddEventImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const maxFileSize = 4.5 * 1024 * 1024;
    const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    if (!selectedFile) {
      return;
    }

    // 2.1. Valida a imagem com relação ao seu tamanho e ao seu tipo

    if (maxFileSize < selectedFile.size) {
      setEventImageError("A imagem deve ter um tamanho de, no máximo, 4.5MB.");
      e.target.value = "";
      return;
    }

    if (!allowedFileTypes.includes(selectedFile.type)) {
      setEventImageError("Formato inválido. Escolha um arquivo com formato PNG, JPG ou WebP.");
      e.target.value ?? "";
      return;
    }

    setEventImageError("");

    // 2.2. Salva a imagem real como file (arquivo esperado pelo prisma e pela action) e o preview como base64

    const reader = new FileReader();

    reader.onload = () => {
      setEventImagePreview(reader.result as string);

      setNewEvent((prev) => ({ ...prev, image: selectedFile }));
    };

    reader.onerror = () => {
      setEventImageError("Erro ao carregar a imagem.");
    };

    reader.readAsDataURL(selectedFile);
    e.target.value ?? "";
  };

  // 3. Finaliza o evento e coloca na tabela

  const handleCreateNewEvent = async () => {
    setEventTitleError("");
    setEventDescriptionError("");
    setEventTagError("");
    setEventAttractionError("");
    setEventDateError("");
    setEventTimeError("");
    setEventImageError("");
    setEventSubmitError("");

    if (!newEvent.title.trim()) {
      setEventTitleError("Insira um título válido.");
      return false;
    }

    if (!newEvent.description.trim()) {
      setEventDescriptionError("Insira uma descrição válida.");
      return false;
    }

    if (!newEvent.tag) {
      setEventTagError("Selecione uma tag.");
      return false;
    }

    if (!newEvent.attractionName.trim()) {
      setEventAttractionError("Selecione uma atração.");
      return false;
    }

    if (!eventDate.trim() || !eventTime.trim()) {
      setEventDateError("Informe a data e o horário do evento.");
      return false;
    }

    if (!newEvent.image) {
      setEventImageError("Adicione uma imagem ao evento.");
      return false;
    }

    const createdEvent = await createEventMutation({ ...newEvent, image: newEvent.image });

    if (!createdEvent) {
      setEventSubmitError("Não foi possível criar o evento.");
      return false;
    }
    return true;
  };

  // 4. Limpa os campos do formulário de criação de evento

  const handleResetForm = () => {
    setEventTitleError("");
    setEventDescriptionError("");
    setEventTagError("");
    setEventAttractionError("");
    setEventDateError("");
    setEventTimeError("");
    setEventImageError("");
    setEventSubmitError("");
    setNewEvent(emptyEvent);
    setEventImagePreview("");
    setEventPrice("");
    setEventDate("");
    setEventTime("");
    setIsDatePickerOpen(false);
  };

  // 5. Recebe data e horário completos do picker (texto ISO) ao clicar em Salvar, guarda no evento, mostra cada parte no seu campo e fecha o picker

  const handleSelectDay = (startsAt: string) => {
    setNewEvent((prev) => ({ ...prev, startsAt }));
    setEventDate(formattedDateToString(new Date(startsAt)));
    setEventTime(formattedDate(startsAt).time);
    setEventDateError("");
    setEventTimeError("");
    setIsDatePickerOpen(false);
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
                : `inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto mx-4 max-h-[calc(100dvh-7rem)] ${
                    isLandscapeMobile ? "max-w-lg" : "max-w-xl"
                  }`
            } bg-black border border-[#B8860B] rounded-lg overflow-hidden overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* - Cabeçalho - */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8860B60]">
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Adicionar Novo Evento</span>

              <motion.button
                className="flex justify-center items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                <X className="text-white/60 hover:text-white h-5 w-5 transition-colors" />
              </motion.button>
            </div>

            {/* - Seção da imagem - */}

            <div className="flex items-center gap-4 px-5 py-4 border-b border-[#B8860B60]">
              <div className="flex justify-center items-center h-20 w-20 border border-dashed border-[#B8860B] rounded-lg shrink-0">
                {eventImagePreview ? (
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src={eventImagePreview}
                    alt="Preview do evento"
                  />
                ) : (
                  <ImagePlus className="text-[#B8860B] h-6 w-6" />
                )}
              </div>

              <input
                className="hidden"
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAddEventImage}
              />

              <motion.button
                className="flex items-center gap-2 border border-[#B8860B] px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#1A1A1A] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="text-[#B8860B] h-4 w-4" />

                <span className="text-white/80 text-sm font-semibold">Adicionar Imagem</span>
              </motion.button>
            </div>

            {/* - Corpo do modal - */}

            <div className="flex flex-col gap-4 px-5 py-4">
              {/* - Título - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Título do Evento</label>

                <input
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
                  type="text"
                  placeholder="Ex: Noite do Rock Nacional"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      title: masks.eventTitle(e.target.value),
                    }))
                  }
                />
              </div>

              {/* - Descrição - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Descrição</label>

                <textarea
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-colors"
                  rows={3}
                  placeholder="Breve descrição do evento"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      description: masks.eventDescription(e.target.value),
                    }))
                  }
                />
              </div>

              {/* - Atração - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Atração</label>

                <ul className="flex flex-col max-h-40 overflow-y-auto bg-[#0A0A0A] border border-[#333] rounded-lg divide-y divide-[#1A1A1A]">
                  {isLoadingAttractions && <li className="px-3 py-2.5 text-sm text-white/40">Carregando atrações...</li>}

                  {!isLoadingAttractions && !attractions?.length && (
                    <li className="px-3 py-2.5 text-sm text-white/40">Nenhuma atração cadastrada.</li>
                  )}

                  {attractions?.map((attraction) => {
                    const isSelected = newEvent.attractionName === attraction.name;

                    return (
                      <li key={attraction.name}>
                        <button
                          className={`flex items-center justify-between w-full px-3 py-2.5 text-left text-sm cursor-pointer transition-colors ${
                            isSelected ? "bg-[#3D2B0A] text-[#B8860B] font-semibold" : "text-white/70 hover:bg-[#1A1A1A] hover:text-white"
                          }`}
                          type="button"
                          onClick={() => {
                            setNewEvent((prev) => ({
                              ...prev,
                              attractionName: attraction.name,
                            }));
                          }}
                        >
                          <span className="truncate">{attraction.name}</span>

                          {isSelected && <span className="h-2 w-2 rounded-full bg-[#B8860B] shrink-0 ml-3" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* - Preço - */}

              <div className="flex flex-row gap-4">
                <div className={`flex flex-col gap-1.5 ${isPortraitMobile ? "flex-1 min-w-0" : "shrink-0 w-28"}`}>
                  <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Preço</label>

                  <div className="flex items-center bg-[#0A0A0A] border border-[#333] focus-within:border-[#B8860B] rounded-lg px-3 transition-colors">
                    <span className="text-[#B8860B] text-sm font-bold mr-1">R$</span>

                    <input
                      type="text"
                      placeholder="0,00"
                      className="bg-transparent py-2.5 text-sm text-white placeholder:text-white/30 outline-none w-full min-w-0"
                      value={eventPrice}
                      onChange={(e) => {
                        const maskedPriceString = masks.eventPrice(e.target.value);
                        setEventPrice(maskedPriceString);

                        const maskedPriceNumber = Number(maskedPriceString.replace(",", "."));
                        setNewEvent((prev) => ({
                          ...prev,
                          price: Number.isNaN(maskedPriceNumber) ? 0 : maskedPriceNumber,
                        }));
                      }}
                    />
                  </div>
                </div>

                {/* - Data e hora - */}

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Data e Horário</label>

                  <div className="flex items-center bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors scheme-dark">
                    <div className="flex">
                      <input
                        className="bg-transparent outline-none"
                        type="text"
                        size={10}
                        placeholder="DD/MM/AAAA"
                        value={eventDate}
                        readOnly
                      />

                      <span className="mx-2">às</span>

                      <input
                        className="bg-transparent outline-none mr-3"
                        type="text"
                        size={5}
                        placeholder="00:00"
                        value={eventTime}
                        readOnly
                      />
                    </div>

                    <FaCalendarAlt
                      className="text-[#B8860B] cursor-pointer ml-auto"
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    />
                  </div>
                </div>
              </div>

              {isDatePickerOpen && (
                <CustomDateTimePicker
                  value={newEvent.startsAt}
                  onChange={handleSelectDay}
                />
              )}

              {/* - Tag - */}

              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Tag</label>

                <div className="flex flex-wrap gap-2">
                  {eventTags.map(({ id, title }) => {
                    const isSelected = newEvent.tag === id;

                    return (
                      <motion.button
                        className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-full border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#3D2B0A] border-[#B8860B] text-[#B8860B]"
                            : "bg-transparent border-[#333] text-white/40 hover:border-white/30"
                        }`}
                        key={id}
                        type="button"
                        onClick={() => {
                          setNewEvent((prev) => ({
                            ...prev,
                            tag: id as EmptyEventType["tag"],
                          }));
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {title}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* - Status - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Status</label>

                <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isUpcoming
                          ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                          : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                      }`}
                    />
                    <span className="text-white text-sm font-semibold">{isUpcoming ? "Em breve" : "Encerrado"}</span>
                  </div>

                  <button
                    className={`relative w-14 h-8 rounded-full cursor-pointer transition-colors ${isUpcoming ? "bg-[#B8860B]" : "bg-[#3A3A3A]"}`}
                    type="button"
                    onClick={() => {
                      setNewEvent((prev) => ({
                        ...prev,
                        status: prev.status === "happened" ? "soon" : "happened",
                      }));
                    }}
                  >
                    <motion.div
                      className="absolute top-1 h-6 w-6 bg-white rounded-full shadow-md"
                      animate={{ left: isUpcoming ? "26px" : "4px" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* - Seção de erro - */}

            <div className="min-h-20 w-full px-5">
              {eventTitleError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {eventTitleError}
                </p>
              )}

              {eventDescriptionError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {eventDescriptionError}
                </p>
              )}

              {eventTagError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {eventTagError}
                </p>
              )}

              {eventAttractionError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {eventAttractionError}
                </p>
              )}

              {eventDateError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {eventDateError}
                </p>
              )}

              {eventTimeError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {eventTimeError}
                </p>
              )}

              {eventImageError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {eventImageError}
                </p>
              )}

              {eventSubmitError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {eventSubmitError}
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
                  const success = await handleCreateNewEvent();

                  if (success) {
                    handleResetForm();
                    onClose();
                  }
                }}
              >
                Adicionar Evento
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { CreateEventModal };
