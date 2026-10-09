"use client";

import { Check, ChevronDown } from "lucide-react";
import { FaSearch } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useEventContext } from "@/features/events";
import { useMobileContext } from "@/shared/hooks";

interface EventsManagementFilterProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

const EventsManagementFilter = ({ onPageChange }: EventsManagementFilterProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile } = useMobileContext();
  const { tags, selectedTag, setSelectedTag, selectedStatus, setSelectedStatus, searchQuery, setSearchQuery } = useEventContext();

  /* - Estado do dropdown - */

  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState<boolean>(false);

  /* - Definições - */

  const statusOptions = [
    { id: "all_status", title: "Ambos" },
    { id: "soon", title: "Em Breve" },
    { id: "happened", title: "Encerrados" },
  ] as const;

  const tagDropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedTagData = tags.find((tag) => tag.id === selectedTag);

  /* - Funções - */

  // 1. Fechando o dropdown ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Confere se um status está marcado

  const isStatusChecked = (statusId: (typeof statusOptions)[number]["id"]) => selectedStatus === statusId;

  // 3. Marcando um status, desmarcar o que já está marcado volta para "all_status"

  const handleToggleStatus = (statusId: (typeof statusOptions)[number]["id"]) => {
    setSelectedStatus(selectedStatus === statusId ? "all_status" : statusId);
    onPageChange(1);
  };

  // 4. Selecionando uma tag

  const handleSelectTag = (tagId: string) => {
    setSelectedTag(tagId);
    setIsTagDropdownOpen(false);
    onPageChange(1);
  };

  return (
    <div className={`flex w-full gap-3 ${isPortraitMobile ? "flex-col" : "flex-row items-center"}`}>
      {/* - Searchbar - */}

      <div
        className={`flex items-center bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none p-2 shrink-0 ${
          isPortraitMobile ? "w-full" : "flex-1"
        }`}
      >
        <FaSearch className="my-auto mx-2 text-white/60 pointer-events-none" />

        <input
          className="bg-transparent text-white font-semibold text-sm outline-none focus:outline-none w-full"
          placeholder="Buscar Evento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* - Filtro - */}

      <div className={`flex flex-row items-center gap-2.5 ${isPortraitMobile ? "w-full" : "shrink-0"}`}>
        <div
          className={`relative shrink-0 ${isPortraitMobile ? "flex-1" : "w-56"}`}
          ref={tagDropdownRef}
        >
          <button
            type="button"
            className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
            onClick={() => setIsTagDropdownOpen((prev) => !prev)}
          >
            <span className="text-white font-semibold">{selectedTagData?.title ?? "Todas as Categorias"}</span>

            <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${isTagDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isTagDropdownOpen && (
            <ul className="absolute z-20 mt-2 w-full bg-[#0A0A0A] border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40">
              {tags.map((tag) => {
                return (
                  <li key={tag.id}>
                    <button
                      type="button"
                      className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm text-left cursor-pointer transition-colors ${
                        selectedTag === tag.id ? "bg-[#B8860B] text-black font-semibold" : "text-white/80 hover:bg-[#1A1A1A]"
                      }`}
                      onClick={() => handleSelectTag(tag.id)}
                    >
                      {tag.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* - Status - */}

        <div
          className={`flex items-center justify-center gap-3 bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm px-3 shrink-0 ${
            isPortraitMobile ? "flex-1" : "w-auto"
          }`}
        >
          {statusOptions.map((status) => (
            <label
              key={status.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isStatusChecked(status.id)}
                onChange={() => handleToggleStatus(status.id)}
              />

              <span
                className={`flex items-center justify-center h-5 w-5 shrink-0 rounded border border-[#B8860B] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#B8860B]/50 ${
                  isStatusChecked(status.id) ? "bg-[#B8860B]" : "bg-transparent"
                }`}
              >
                {isStatusChecked(status.id) && (
                  <Check
                    className="h-4 w-4 text-black"
                    strokeWidth={3}
                  />
                )}
              </span>

              <span className="text-white/60">{status.title}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export { EventsManagementFilter };
