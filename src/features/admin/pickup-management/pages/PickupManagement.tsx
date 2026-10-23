"use client";

import { FaSearch } from "react-icons/fa";
import { motion } from "motion/react";
import { PickupOrderCard } from "../components/PickupOrderCard";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { usePickup } from "../hooks/usePickup";
import { useState } from "react";
import type { PickupOrderProps, PickupOrderType } from "../types/pickupOrder";

const PickupManagement = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Estados da busca - */

  const [type, setType] = useState<PickupOrderType>("tickets");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [submittedQuery, setSubmittedQuery] = useState<string>("");

  /* - Puxando do hook - */

  const { orders, isLoading, error, registerPickupMutation } = usePickup(type, submittedQuery);

  /* - Definições - */

  const typeOptions: { id: PickupOrderType; title: string }[] = [
    { id: "tickets", title: "Ingressos" },
    { id: "vouchers", title: "Vouchers" },
  ];

  const hasSearched = submittedQuery.length >= 3;

  /* - Funções - */

  // 1. Envia a busca (o código do pedido ou o nome/e-mail do cliente)

  const handleSearch = () => {
    setSubmittedQuery(searchQuery.trim());
  };

  // 2. Registra a retirada do pedido escolhido

  const handleRegister = (order: PickupOrderProps) => registerPickupMutation({ orderId: order.id, type: order.type });

  return (
    <div className={`bg-[#1A1A1A] min-h-screen w-full ${isPortraitMobile ? "pb-10" : isLandscapeMobile ? "pb-12 px-6" : "pb-14 px-8"}`}>
      <div className="flex flex-col max-w-6xl w-full mx-auto gap-6 px-4">
        <div className={`flex ${isPortraitMobile ? "flex-col" : "flex-row justify-between items-stretch gap-0"}`}>
          {/* - Título - */}

          <div className={`flex flex-col items-start ${isPortraitMobile ? "mb-4" : "mb-0"}`}>
            <span className={`text-white font-semibold mb-2 ${isPortraitMobile ? "text-lg" : isLandscapeMobile ? "text-xl" : "text-2xl"}`}>
              Retirada de Pedidos
            </span>

            {/* - Subtítulo - */}

            <span className="text-white/60 mb-12">Busque pelo código do pedido ou pelo nome ou e-mail do cliente e registre a retirada</span>
          </div>
        </div>

        {/* - Abas - */}

        <ul className="flex gap-4 sm:gap-6">
          {typeOptions.map((option) => (
            <motion.li
              className={`my-auto font-semibold cursor-pointer ${
                type === option.id
                  ? "bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-[#B8860B] to-yellow-700 underline"
                  : "text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-[#B8860B] hover:to-yellow-700 hover:underline"
              }`}
              key={option.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setType(option.id)}
            >
              {option.title}
            </motion.li>
          ))}
        </ul>

        {/* - Busca - */}

        <div className={`flex w-full gap-3 ${isPortraitMobile ? "flex-col" : "flex-row items-center"}`}>
          <div
            className={`flex items-center bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none p-2 shrink-0 ${
              isPortraitMobile ? "w-full" : "flex-1"
            }`}
          >
            <FaSearch className="my-auto mx-2 text-white/60 pointer-events-none" />

            <input
              className="bg-transparent text-white font-semibold text-sm outline-none focus:outline-none w-full"
              placeholder="Código do pedido, nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <button
              type="button"
              className="shrink-0 h-8 px-3 bg-[#B8860B] hover:bg-[#DDAE56] text-black text-xs sm:text-sm font-semibold rounded-md cursor-pointer transition-colors"
              onClick={handleSearch}
            >
              Buscar
            </button>
          </div>
        </div>

        {/* - Mensagens - */}

        {!hasSearched && <p className="text-white/60 font-semibold text-lg text-center py-5">Digite pelo menos 3 caracteres para buscar.</p>}

        {hasSearched && isLoading && <p className="text-white/60 font-semibold text-lg text-center py-5">Buscando pedidos...</p>}

        {hasSearched && !isLoading && error && <p className="text-red-500 font-semibold text-lg text-center py-5">Erro ao buscar pedidos.</p>}

        {hasSearched && !isLoading && !error && orders.length === 0 && (
          <p className="text-white/60 font-semibold text-lg text-center py-5">Nenhum pedido encontrado.</p>
        )}

        {/* - Lista de pedidos - */}

        {hasSearched && !isLoading && !error && orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-3">
            {orders.map((order) => (
              <PickupOrderCard
                key={order.id}
                order={order}
                onRegister={handleRegister}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { PickupManagement };
