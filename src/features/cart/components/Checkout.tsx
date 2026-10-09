"use client";

import { CartItemCard } from "./CartItemCard";
import { GiShoppingCart } from "react-icons/gi";
import { motion } from "motion/react";
import { useCartContext } from "../hooks/useCartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PaymentMethod } from "@/prisma/generated/prisma/enums";

const paymentMethods: { id: PaymentMethod; title: string }[] = [
  { id: "pix", title: "Pix" },
  { id: "creditCard", title: "Cartão de crédito" },
  { id: "debitCard", title: "Cartão de débito" },
  { id: "cash", title: "Dinheiro" },
];

const Checkout = () => {
  /* - Puxando do context - */

  const {
    cartItems,
    isLoading,
    error,
    handleIncreaseItemQuantity,
    handleDecreaseItemQuantity,
    handleClearCart,
    handleCheckout,
    totalItemPrice,
    serviceFee,
    totalPrice,
  } = useCartContext();

  /* - Estados do pagamento - */

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("pix");

  /* - Estados de envio - */

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /* - Estados de erro - */

  const [checkoutError, setCheckoutError] = useState<string>("");

  /* - Definições - */

  const router = useRouter();
  const tickets = cartItems.filter((item) => item.type === "tickets");
  const drinks = cartItems.filter((item) => item.type === "drinks");

  const formattedPrice = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

  /* - Funções - */

  // 1. Faz o scroll da página voltar para o topo no momento da renderização

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Finaliza a compra e leva o usuário para onde o pedido pode ser acompanhado

  const handleConfirmCheckout = async () => {
    setCheckoutError("");
    setIsSubmitting(true);

    try {
      const result = await handleCheckout({ method: selectedMethod });

      if (!result) {
        setCheckoutError("Não foi possível finalizar a compra. Verifique os itens do carrinho e tente novamente.");
        return;
      }

      // 2.1. Pedido com ingressos tem tela própria. Pedido só de bebidas fica no perfil

      router.replace(result.ticketOrderId ? `/pedidos/${result.ticketOrderId}` : "/perfil");
    } catch {
      setCheckoutError("Não foi possível finalizar a compra. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full pt-32 pb-14 px-4 bg-[#1A1A1A]">
      <div className="flex flex-col w-full max-w-3xl gap-6">
        {/* - Título - */}

        <span className="text-white font-semibold text-2xl sm:text-3xl">Finalizar Compra</span>

        {/* - Estados de carregamento e erro - */}

        {isLoading && <p className="text-white/60 text-center p-12">Carregando carrinho...</p>}

        {!isLoading && error && <p className="text-red-500 text-center p-12">Erro ao buscar o carrinho.</p>}

        {/* - Carrinho vazio - */}

        {!isLoading && !error && cartItems.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-12 bg-black border border-[#B8860B] rounded-lg">
            <GiShoppingCart className="h-12 w-12 text-[#B8860B60]" />

            <p className="text-white/60 font-semibold">Seu carrinho está vazio.</p>

            <Link
              className="text-sm text-[#B8860B] hover:underline"
              href="/"
            >
              Voltar para o início
            </Link>
          </div>
        )}

        {/* - Conteúdo do carrinho - */}

        {!isLoading && !error && cartItems.length > 0 && (
          <>
            {/* - Itens - */}

            <div className="flex flex-col items-center gap-3 w-full py-6 bg-black border border-[#B8860B] rounded-lg">
              {tickets.length > 0 && <span className="w-[90%] text-xs font-bold text-[#B8860B] uppercase tracking-wider">Ingressos</span>}

              {tickets.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  handleIncreaseItemQuantity={handleIncreaseItemQuantity}
                  handleDecreaseItemQuantity={handleDecreaseItemQuantity}
                />
              ))}

              {drinks.length > 0 && <span className="w-[90%] text-xs font-bold text-[#B8860B] uppercase tracking-wider">Drinks</span>}

              {drinks.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  handleIncreaseItemQuantity={handleIncreaseItemQuantity}
                  handleDecreaseItemQuantity={handleDecreaseItemQuantity}
                />
              ))}

              <button
                className="text-sm text-white/60 hover:underline font-semibold mt-2 cursor-pointer"
                onClick={handleClearCart}
              >
                Limpar Carrinho
              </button>
            </div>

            {/* - Forma de pagamento - */}

            <div className="flex flex-col w-full bg-black border border-[#B8860B] rounded-lg">
              <span className="text-white font-semibold text-xl p-6 border-b border-[#B8860B60]">Forma de pagamento</span>

              <div className="flex flex-wrap gap-3 p-6">
                {paymentMethods.map((method) => (
                  <button
                    className={`px-4 py-2 text-sm font-semibold border rounded-lg cursor-pointer ${
                      selectedMethod === method.id
                        ? "text-[#DDAE56] bg-[#3D2B0A] border-[#B8860B]"
                        : "text-white/60 bg-[#1A1A1A] border-[#B8860B60] hover:border-[#B8860B]"
                    }`}
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    {method.title}
                  </button>
                ))}
              </div>
            </div>

            {/* - Resumo - */}

            <div className="flex flex-col w-full gap-2 p-6 bg-black border border-[#B8860B] rounded-lg">
              <div className="flex justify-between w-full">
                <span className="text-white/60 text-sm font-semibold">Subtotal</span>

                <span className="text-white text-sm font-semibold">{formattedPrice(totalItemPrice)}</span>
              </div>

              <div className="flex justify-between w-full">
                <span className="text-white/60 text-sm font-semibold">Taxa de serviço</span>

                <span className="text-white text-sm font-semibold">{formattedPrice(serviceFee)}</span>
              </div>

              <div className="flex justify-between w-full pt-4 mt-2 border-t border-[#B8860B60]">
                <span className="text-white font-semibold">Total</span>

                <span className="text-[#B8860B] font-semibold text-lg">{formattedPrice(totalPrice)}</span>
              </div>

              {/* - Seção de erro - */}

              {checkoutError && (
                <p className="flex items-center justify-center h-12 mt-4 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {checkoutError}
                </p>
              )}

              <motion.button
                className="flex justify-center px-4 py-2 mt-4 text-[#B8860B] font-semibold bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-sm shadow-[#DDAE56] disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                onClick={handleConfirmCheckout}
              >
                {isSubmitting ? "Finalizando..." : "Confirmar Compra"}
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { Checkout };
