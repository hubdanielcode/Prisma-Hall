"use client";

import { ChevronDown } from "lucide-react";
import { EventCard } from "@/features/events/event/components/EventCard";
import { FaSearch } from "react-icons/fa";
import { IoTicketOutline, IoHelp } from "react-icons/io5";
import { masks } from "@/shared/utils/functions/masks";
import { MdOutlineCancel } from "react-icons/md";
import { motion } from "motion/react";
import { orderStatusBadgeStyles, paymentStatusBadgeStyles, pickupStatusBadgeStyles } from "@/shared/utils/constants/orderBadgeStyles";
import { ProductCard } from "@/features/bar/components/ProductCard";
import { useEffect, useRef, useState } from "react";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useTickets } from "@/features/users/tickets/hooks/useTickets";
import { useVouchers } from "@/features/users/vouchers/hooks/useVouchers";
import Link from "next/link";
import type { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma/enums";

const ProfileOrdersSection = () => {
  /* - Puxando dos hooks - */

  const { isPortraitMobile } = useMobileContext();
  const { tickets, isLoading: isLoadingTickets } = useTickets();
  const { vouchers, isLoading: isLoadingVouchers } = useVouchers();

  /* - Estado da aba ativa - */

  const [activeTab, setActiveTab] = useState<string>("tickets");

  /* - Estados de filtro - */

  const [paymentFilter, setPaymentFilter] = useState<"all" | "confirmed" | "pending" | "failed" | "refunded">("all");
  const [eventFilter, setEventFilter] = useState<"all" | "soon" | "happened">("all");
  const [pickupFilter, setPickupFilter] = useState<"all" | "pickedUp" | "notPickedUp">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  /* - Estados dos dropdowns - */

  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState<boolean>(false);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState<boolean>(false);
  const [isPickupDropdownOpen, setIsPickupDropdownOpen] = useState<boolean>(false);

  /* - Definições - */

  const navLinks = [
    { id: "tickets", title: "Ingressos" },
    { id: "vouchers", title: "Pedidos" },
  ];

  const paymentOptions = [
    { id: "all", title: "Status de Pagamento" },
    { id: "confirmed", title: "Confirmado" },
    { id: "pending", title: "Pendente" },
    { id: "failed", title: "Falhou" },
    { id: "refunded", title: "Reembolsado" },
  ] as const;

  const eventOptions = [
    { id: "all", title: "Status de Evento" },
    { id: "soon", title: "Em breve" },
    { id: "happened", title: "Encerrado" },
  ] as const;

  const pickupOptions = [
    { id: "all", title: "Status de Retirada" },
    { id: "pickedUp", title: "Retirado" },
    { id: "notPickedUp", title: "Não retirado" },
  ] as const;

  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const pickupDropdownRef = useRef<HTMLDivElement>(null);

  const selectedPaymentData = paymentOptions.find((payment) => payment.id === paymentFilter);
  const selectedEventData = eventOptions.find((event) => event.id === eventFilter);
  const selectedPickupData = pickupOptions.find((pickup) => pickup.id === pickupFilter);

  /* - Funções - */

  // 1. Faz o scroll da página voltar para o topo no momento da renderização

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Fechando os dropdowns ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(e.target as Node)) {
        setIsPaymentDropdownOpen(false);
      }

      if (eventDropdownRef.current && !eventDropdownRef.current.contains(e.target as Node)) {
        setIsEventDropdownOpen(false);
      }

      if (pickupDropdownRef.current && !pickupDropdownRef.current.contains(e.target as Node)) {
        setIsPickupDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Troca de aba e limpa os filtros, já que as duas abas não têm os mesmos grupos

  const handleChangeTab = (tabId: string) => {
    setActiveTab(tabId);
    setPaymentFilter("all");
    setEventFilter("all");
    setPickupFilter("all");
    setSearchQuery("");
  };

  // 4. Selecionando um status de pagamento

  const handleSelectPayment = (paymentId: (typeof paymentOptions)[number]["id"]) => {
    setPaymentFilter(paymentId);
    setIsPaymentDropdownOpen(false);
  };

  // 5. Selecionando uma situação de evento

  const handleSelectEvent = (eventId: (typeof eventOptions)[number]["id"]) => {
    setEventFilter(eventId);
    setIsEventDropdownOpen(false);
  };

  // 6. Selecionando uma situação de retirada

  const handleSelectPickup = (pickupId: (typeof pickupOptions)[number]["id"]) => {
    setPickupFilter(pickupId);
    setIsPickupDropdownOpen(false);
  };

  // 7. Confere se um item passa pelos filtros de pagamento e de retirada, que as duas abas compartilham

  const matchesPaymentAndPickup = (paymentStatus: PaymentStatus, pickedUpAt: string | null) => {
    if (paymentFilter !== "all" && paymentStatus !== paymentFilter) {
      return false;
    }

    if (pickupFilter === "pickedUp" && !pickedUpAt) {
      return false;
    }

    if (pickupFilter === "notPickedUp" && pickedUpAt) {
      return false;
    }

    return true;
  };

  // 8. Linha de selos que aparece no rodapé de cada card

  const renderBadges = (orderStatus: OrderStatus, paymentStatus: PaymentStatus, pickedUpAt: string | null) => {
    const paymentDisplayName = masks.paymentStatus(paymentStatus);
    const paymentBadge = paymentStatusBadgeStyles[paymentDisplayName];

    const pickupDisplayName = masks.pickupStatus(pickedUpAt ? "pickedUp" : "notPickedUp");
    const pickupBadge = pickupStatusBadgeStyles[pickupDisplayName];

    const orderDisplayName = masks.orderStatus(orderStatus);
    const orderBadge = orderStatusBadgeStyles[orderDisplayName];

    return (
      <div className="flex flex-wrap gap-2">
        {/* - Pagamento - */}

        <div className={`flex justify-center items-center px-2 py-1 w-fit border rounded-full ${paymentBadge.background} ${paymentBadge.border}`}>
          <span className={`text-xs font-semibold uppercase ${paymentBadge.text}`}>{paymentDisplayName}</span>
        </div>

        {/* - Retirada - */}

        <div className={`flex justify-center items-center px-2 py-1 w-fit border rounded-full ${pickupBadge.background} ${pickupBadge.border}`}>
          <span className={`text-xs font-semibold uppercase ${pickupBadge.text}`}>
            {pickedUpAt ? `${pickupDisplayName} em ${new Date(pickedUpAt).toLocaleDateString("pt-BR")}` : pickupDisplayName}
          </span>
        </div>

        {/* - Pedido cancelado - */}

        {orderStatus === "cancelled" && (
          <div className={`flex justify-center items-center px-2 py-1 w-fit border rounded-full ${orderBadge.background} ${orderBadge.border}`}>
            <span className={`text-xs font-semibold uppercase ${orderBadge.text}`}>{orderDisplayName}</span>
          </div>
        )}
      </div>
    );
  };

  // 9. Links de ação do rodapé, o cancelamento só aparece se o pedido ainda pode ser cancelado

  const renderLinks = (orderId: string, canCancel: boolean) => (
    <>
      {/* - Ver pedido - */}

      <Link
        className="flex items-center gap-3 text-sm text-white/60 uppercase pt-3 cursor-pointer group/link"
        href={`/pedidos/${orderId}`}
      >
        <IoTicketOutline className="group-hover/link:text-[#B8860B]" />

        <span className="group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-linear-to-br group-hover/link:from-yellow-500 group-hover/link:via-[#B8860B] group-hover/link:to-yellow-700 group-hover/link:underline">
          Ver Pedido
        </span>
      </Link>

      {/* - Preciso de ajuda - */}

      <Link
        className="flex items-center gap-3 text-sm text-white/60 uppercase pt-3 cursor-pointer group/link"
        href="/central-de-ajuda"
      >
        <IoHelp className="group-hover/link:text-[#B8860B]" />

        <span className="group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-linear-to-br group-hover/link:from-yellow-500 group-hover/link:via-[#B8860B] group-hover/link:to-yellow-700 group-hover/link:underline">
          Preciso de Ajuda
        </span>
      </Link>

      {/* - Cancelar pedido - */}

      {canCancel && (
        <Link
          className="flex items-center gap-3 text-sm text-white/60 uppercase pt-3 cursor-pointer group/link"
          href={`/pedidos/${orderId}/cancelar`}
        >
          <MdOutlineCancel className="group-hover/link:text-[#B8860B]" />

          <span className="group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-linear-to-br group-hover/link:from-yellow-500 group-hover/link:via-[#B8860B] group-hover/link:to-yellow-700 group-hover/link:underline">
            Cancelar Pedido
          </span>
        </Link>
      )}
    </>
  );

  // 10. Filtra os ingressos por pagamento, por situação do evento e por retirada

  const filteredTickets = (tickets ?? [])
    .filter((ticket) => {
      if (!ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (eventFilter !== "all" && ticket.event.status !== eventFilter) {
        return false;
      }

      return matchesPaymentAndPickup(ticket.paymentStatus, ticket.pickedUpAt);
    })
    .map((ticket, index) => (
      <EventCard
        key={ticket.id}
        event={ticket.event}
        index={index}
        footer={
          <div className="flex flex-col w-full items-start justify-center gap-2 pt-4">
            {renderBadges(ticket.orderStatus, ticket.paymentStatus, ticket.pickedUpAt)}
            {renderLinks(ticket.orderId, ticket.orderStatus !== "cancelled" && ticket.event.status === "soon" && !ticket.pickedUpAt)}
          </div>
        }
      />
    ));

  // 11. Filtra os vouchers por pagamento e por retirada

  const filteredVouchers = (vouchers ?? [])
    .filter(
      (voucher) =>
        voucher.product.name.toLowerCase().includes(searchQuery.toLowerCase()) && matchesPaymentAndPickup(voucher.paymentStatus, voucher.pickedUpAt),
    )
    .map((voucher, index) => (
      <ProductCard
        key={voucher.id}
        product={voucher.product}
        index={index}
        description={`Quantidade: ${voucher.quantity}`}
        footer={
          <div className="flex flex-col w-full items-start justify-center gap-2 p-4">
            {renderBadges(voucher.orderStatus, voucher.paymentStatus, voucher.pickedUpAt)}
            {renderLinks(voucher.orderId, voucher.orderStatus !== "cancelled" && !voucher.pickedUpAt)}
          </div>
        }
      />
    ));

  const isLoading = activeTab === "tickets" ? isLoadingTickets : isLoadingVouchers;
  const filteredItems = activeTab === "tickets" ? filteredTickets : filteredVouchers;
  const emptyMessage = activeTab === "tickets" ? "Nenhum ingresso encontrado com esses filtros." : "Nenhum pedido encontrado com esses filtros.";

  return (
    <div className="flex flex-col min-h-screen max-w-full pt-32 px-4 sm:px-6">
      {/* - Título - */}

      <div className="flex items-center justify-center w-full pb-4 sm:p-6">
        <span className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl whitespace-nowrap pb-8">
          {activeTab === "tickets" ? "Meus Ingressos" : "Meus Pedidos"}
        </span>
      </div>

      {/* - Abas - */}

      <ul className="flex justify-center gap-4 sm:gap-6">
        {navLinks.map((link) => (
          <motion.li
            className={`my-auto font-semibold cursor-pointer ${
              activeTab === link.id
                ? "bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-[#B8860B] to-yellow-700 underline"
                : "text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-[#B8860B] hover:to-yellow-700 hover:underline"
            }`}
            key={link.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleChangeTab(link.id)}
          >
            {link.title}
          </motion.li>
        ))}
      </ul>

      {/* - Filtros - */}

      <div className={`flex w-full max-w-6xl mx-auto gap-3 mt-4 sm:mt-6 ${isPortraitMobile ? "flex-col" : "flex-row items-center"}`}>
        {/* - Searchbar - */}

        <div
          className={`flex items-center bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none p-2 shrink-0 ${
            isPortraitMobile ? "w-full" : "flex-1"
          }`}
        >
          <FaSearch className="my-auto mx-2 text-white/60 pointer-events-none" />

          <input
            className="bg-transparent text-white font-semibold text-sm outline-none focus:outline-none w-full"
            placeholder={activeTab === "tickets" ? "Buscar Evento..." : "Buscar Produto..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* - Dropdowns - */}

        <div className={`flex flex-row items-center gap-2.5 ${isPortraitMobile ? "w-full" : "shrink-0"}`}>
          {/* - Pagamento - */}

          <div
            className={`relative shrink-0 ${isPortraitMobile ? "flex-1" : "w-56"}`}
            ref={paymentDropdownRef}
          >
            <button
              type="button"
              className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
              onClick={() => setIsPaymentDropdownOpen((prev) => !prev)}
            >
              <span className="text-white font-semibold">{selectedPaymentData?.title ?? "Todos os Pagamentos"}</span>

              <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${isPaymentDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isPaymentDropdownOpen && (
              <ul className="absolute z-20 mt-2 w-full bg-[#0A0A0A] border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40">
                {paymentOptions.map((payment) => (
                  <li key={payment.id}>
                    <button
                      type="button"
                      className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm text-left cursor-pointer transition-colors ${
                        paymentFilter === payment.id ? "bg-[#B8860B] text-black font-semibold" : "text-white/80 hover:bg-[#1A1A1A]"
                      }`}
                      onClick={() => handleSelectPayment(payment.id)}
                    >
                      {payment.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* - Situação do evento (só na aba de ingressos) - */}

          {activeTab === "tickets" && (
            <div
              className={`relative shrink-0 ${isPortraitMobile ? "flex-1" : "w-48"}`}
              ref={eventDropdownRef}
            >
              <button
                type="button"
                className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
                onClick={() => setIsEventDropdownOpen((prev) => !prev)}
              >
                <span className="text-white font-semibold">{selectedEventData?.title ?? "Todos os Eventos"}</span>

                <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${isEventDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isEventDropdownOpen && (
                <ul className="absolute z-20 mt-2 w-full bg-[#0A0A0A] border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40">
                  {eventOptions.map((event) => (
                    <li key={event.id}>
                      <button
                        type="button"
                        className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm text-left cursor-pointer transition-colors ${
                          eventFilter === event.id ? "bg-[#B8860B] text-black font-semibold" : "text-white/80 hover:bg-[#1A1A1A]"
                        }`}
                        onClick={() => handleSelectEvent(event.id)}
                      >
                        {event.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* - Retirada - */}

          <div
            className={`relative shrink-0 ${isPortraitMobile ? "flex-1" : "w-48"}`}
            ref={pickupDropdownRef}
          >
            <button
              type="button"
              className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
              onClick={() => setIsPickupDropdownOpen((prev) => !prev)}
            >
              <span className="text-white font-semibold">{selectedPickupData?.title ?? "Todas as Retiradas"}</span>

              <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${isPickupDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isPickupDropdownOpen && (
              <ul className="absolute z-20 mt-2 w-full bg-[#0A0A0A] border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40">
                {pickupOptions.map((pickup) => (
                  <li key={pickup.id}>
                    <button
                      type="button"
                      className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm text-left cursor-pointer transition-colors ${
                        pickupFilter === pickup.id ? "bg-[#B8860B] text-black font-semibold" : "text-white/80 hover:bg-[#1A1A1A]"
                      }`}
                      onClick={() => handleSelectPickup(pickup.id)}
                    >
                      {pickup.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* - Mensagem de carregamento - */}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto w-full max-w-6xl py-6 gap-3">
          <span className="text-white/60 font-semibold text-lg text-center col-span-full py-5">
            {activeTab === "tickets" ? "Carregando lista de ingressos..." : "Carregando lista de vouchers..."}
          </span>
        </div>
      )}

      {/* - Lista filtrada - */}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto w-full max-w-6xl py-12 gap-3">
          {filteredItems.length > 0 ? (
            filteredItems
          ) : (
            <p className="text-white/60 font-semibold text-lg text-center col-span-full py-5">{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export { ProfileOrdersSection };
