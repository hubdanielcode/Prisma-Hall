"use client";

import { AnimatePresence, motion } from "motion/react";
import { createGalleryPictureSchema } from "@/lib/validations/admin/events-management/gallery-management/createGalleryPictureSchema";
import { CustomDateTimePicker } from "@/shared/components/ui/CustomDateTimePicker";
import { FaCalendarAlt } from "react-icons/fa";
import { formattedDate, formattedDateToString } from "@/shared/utils/functions/dates";
import { ImagePlus, X } from "lucide-react";
import { masks } from "@/shared/utils/functions/masks";
import { useBlockScroll } from "@/shared/hooks/useBlockScroll";
import { useEvents } from "@/features/events/event/hooks/useEvents";
import { useGallery } from "@/features/events/gallery/hooks/useGallery";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useRef, useState } from "react";
import z from "zod";

interface CreateGalleryPictureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EmptyPictureType = Omit<z.infer<typeof createGalleryPictureSchema>, "image"> & { image: File | null };

const emptyPicture: EmptyPictureType = {
  eventId: "",
  title: "",
  image: null,
  happenedAt: new Date(),
};

const CreateGalleryPictureModal = ({ isOpen, onClose }: CreateGalleryPictureModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { createPictureMutation } = useGallery();
  const { events, isLoading: isLoadingEvents } = useEvents();

  /* - Estados da foto - */

  const [pictureDate, setPictureDate] = useState<string>("");
  const [pictureTime, setPictureTime] = useState<string>("");
  const [pictureImagePreview, setPictureImagePreview] = useState<string>("");
  const [newPicture, setNewPicture] = useState<EmptyPictureType>(emptyPicture);

  /* - Estados de erro - */

  const [pictureTitleError, setPictureTitleError] = useState<string>("");
  const [pictureEventError, setPictureEventError] = useState<string>("");
  const [pictureDateError, setPictureDateError] = useState<string>("");
  const [pictureImageError, setPictureImageError] = useState<string>("");
  const [pictureSubmitError, setPictureSubmitError] = useState<string>("");

  /* - Estados do calendário - */

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  /* - Definições - */

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Permite que o admin adicione a imagem da foto que será enviada para a galeria

  const handleAddPictureImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const maxFileSize = 4.5 * 1024 * 1024;
    const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    if (!selectedFile) {
      return;
    }

    // 2.1. Valida a imagem com relação ao seu tamanho e ao seu tipo

    if (maxFileSize < selectedFile.size) {
      setPictureImageError("A imagem deve ter um tamanho de, no máximo, 4.5MB.");
      e.target.value = "";
      return;
    }

    if (!allowedFileTypes.includes(selectedFile.type)) {
      setPictureImageError("Formato inválido. Escolha um arquivo com formato PNG, JPG ou WebP.");
      e.target.value = "";
      return;
    }

    setPictureImageError("");

    // 2.2. Salva a imagem real como file (arquivo esperado pela action) e o preview como base64

    const reader = new FileReader();

    reader.onload = () => {
      setPictureImagePreview(reader.result as string);

      setNewPicture((prev) => ({ ...prev, image: selectedFile }));
    };

    reader.onerror = () => {
      setPictureImageError("Erro ao carregar a imagem.");
    };

    reader.readAsDataURL(selectedFile);
    e.target.value = "";
  };

  // 3. Envia a foto para a galeria

  const handleCreateNewPicture = async () => {
    setPictureTitleError("");
    setPictureEventError("");
    setPictureDateError("");
    setPictureImageError("");
    setPictureSubmitError("");

    if (!newPicture.title.trim()) {
      setPictureTitleError("Insira um título válido.");
      return false;
    }

    if (!newPicture.eventId) {
      setPictureEventError("Selecione um evento.");
      return false;
    }

    if (!pictureDate.trim() || !pictureTime.trim()) {
      setPictureDateError("Informe a data e o horário da foto.");
      return false;
    }

    if (!newPicture.image) {
      setPictureImageError("Adicione uma imagem à foto.");
      return false;
    }

    const createdPicture = await createPictureMutation({ ...newPicture, image: newPicture.image });

    if (createdPicture === "event_not_found") {
      setPictureSubmitError("Esse evento não existe mais. Escolha outro evento.");
      return false;
    }

    if (!createdPicture) {
      setPictureSubmitError("Não foi possível enviar a foto.");
      return false;
    }

    return true;
  };

  // 4. Limpa os campos do formulário de envio de foto

  const handleResetForm = () => {
    setPictureTitleError("");
    setPictureEventError("");
    setPictureDateError("");
    setPictureImageError("");
    setPictureSubmitError("");
    setNewPicture(emptyPicture);
    setPictureImagePreview("");
    setPictureDate("");
    setPictureTime("");
    setIsDatePickerOpen(false);
  };

  // 5. Recebe data e horário completos do picker (texto ISO) ao clicar em Salvar, guarda na foto, mostra cada parte no seu campo e fecha o picker

  const handleSelectDay = (happenedAt: string) => {
    setNewPicture((prev) => ({ ...prev, happenedAt: new Date(happenedAt) }));
    setPictureDate(formattedDateToString(new Date(happenedAt)));
    setPictureTime(formattedDate(happenedAt).time);
    setPictureDateError("");
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
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Enviar Nova Foto</span>

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
                {pictureImagePreview ? (
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src={pictureImagePreview}
                    alt="Preview da foto"
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
                onChange={handleAddPictureImage}
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
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Título da Foto</label>

                <input
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
                  type="text"
                  placeholder="Ex: Noite do Rock Nacional"
                  value={newPicture.title}
                  onChange={(e) =>
                    setNewPicture((prev) => ({
                      ...prev,
                      title: masks.eventTitle(e.target.value),
                    }))
                  }
                />
              </div>

              {/* - Evento - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Evento</label>

                <ul className="flex flex-col max-h-40 overflow-y-auto bg-[#0A0A0A] border border-[#333] rounded-lg divide-y divide-[#1A1A1A]">
                  {isLoadingEvents && <li className="px-3 py-2.5 text-sm text-white/40">Carregando eventos...</li>}

                  {!isLoadingEvents && !events?.length && <li className="px-3 py-2.5 text-sm text-white/40">Nenhum evento cadastrado.</li>}

                  {events?.map((event) => {
                    const isSelected = newPicture.eventId === event.id;

                    return (
                      <li key={event.id}>
                        <button
                          className={`flex items-center justify-between w-full px-3 py-2.5 text-left text-sm cursor-pointer transition-colors ${
                            isSelected ? "bg-[#3D2B0A] text-[#B8860B] font-semibold" : "text-white/70 hover:bg-[#1A1A1A] hover:text-white"
                          }`}
                          type="button"
                          onClick={() => {
                            setNewPicture((prev) => ({
                              ...prev,
                              eventId: event.id,
                            }));
                          }}
                        >
                          <span className="truncate">{event.title}</span>

                          <span className="text-xs text-white/40 shrink-0 ml-3">{formattedDateToString(new Date(event.startsAt))}</span>

                          {isSelected && <span className="h-2 w-2 rounded-full bg-[#B8860B] shrink-0 ml-3" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
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
                      value={pictureDate}
                      readOnly
                    />

                    <span className="mx-2">às</span>

                    <input
                      className="bg-transparent outline-none mr-3"
                      type="text"
                      size={5}
                      placeholder="00:00"
                      value={pictureTime}
                      readOnly
                    />
                  </div>

                  <FaCalendarAlt
                    className="text-[#B8860B] cursor-pointer ml-auto"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  />
                </div>
              </div>

              {isDatePickerOpen && (
                <CustomDateTimePicker
                  value={newPicture.happenedAt.toISOString()}
                  onChange={handleSelectDay}
                />
              )}
            </div>

            {/* - Seção de erro - */}

            <div className="min-h-20 w-full px-5">
              {pictureTitleError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {pictureTitleError}
                </p>
              )}

              {pictureEventError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {pictureEventError}
                </p>
              )}

              {pictureDateError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {pictureDateError}
                </p>
              )}

              {pictureImageError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {pictureImageError}
                </p>
              )}

              {pictureSubmitError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {pictureSubmitError}
                </p>
              )}
            </div>

            {/* - Ações - */}

            <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-[#B8860B60]">
              <motion.button
                className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  handleResetForm();
                  onClose();
                }}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-[#B8860B] font-semibold bg-[#3D2B0A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-sm shadow-[#DDAE56] transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const success = await handleCreateNewPicture();

                  if (success) {
                    handleResetForm();
                    onClose();
                  }
                }}
              >
                Enviar Foto
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { CreateGalleryPictureModal };
