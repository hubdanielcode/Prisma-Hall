import { CartItemCard } from "./CartItemCard";
import { FaWineGlassAlt } from "react-icons/fa";
import { GiShoppingCart } from "react-icons/gi";
import { GiTicket } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import { useCartContext } from "../hooks/useCartContext";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  /* - Puxando do context - */

  const {
    cartItems,
    setIsCartOpen,
    handleIncreaseItemQuantity,
    handleDecreaseItemQuantity,
    handleClearCart,
    totalItemPrice,
    serviceFee,
    totalPrice,
  } = useCartContext();

  /* - Definições - */

  const cartDrawerRef = useRef<HTMLDivElement | null>(null);
  const tickets = cartItems.filter((item) => item.type === "tickets");
  const drinks = cartItems.filter((item) => item.type === "drinks");

  /* - Funções - */

  // 1. Fechando o carrinho se clicar fora dele

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside =
        !isOpen ||
        !cartDrawerRef.current ||
        cartDrawerRef.current.contains(e.target as Node);

      if (clickedInside) return;
      setIsCartOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* - Background - */}

          <motion.div
            className="fixed inset-0 bg-black/70 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* - Carrinho - */}

          <motion.div
            className="fixed top-0 right-0 flex flex-col items-center min-h-screen w-85 bg-linear-to-t from-[#06080F] via-[#050505] to-[#06080F] border-l border-[#B8860B] z-50"
            ref={cartDrawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8 }}
          >
            {/* - Header do carrinho - */}

            <div className="flex items-center justify-between w-full px-5 py-4 bg-black border-b border-[#B8860B60]">
              <div className="flex items-center gap-3 h-12">
                <GiShoppingCart className="h-6 w-6 text-[#B8860B]" />

                <span className="text-lg text-white font-semibold">
                  Seu Carrinho
                </span>
              </div>

              <motion.button
                className="group flex items-center justify-center bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#B8860B] rounded-full p-1 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                <X className="h-5 w-5 text-[#B8860B] group-hover:text-[#DDAE56]" />
              </motion.button>
            </div>

            {/* - Items do carrinho - */}

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3">
                <GiShoppingCart className="h-12 w-12 text-[#B8860B60]" />

                <p className="text-white/40 font-semibold text-base">
                  Seu carrinho está vazio.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full flex-1 overflow-y-auto py-4 gap-3">
                {/* - Seção de Ingressos - */}

                {tickets.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 w-[90%]">
                      <GiTicket className="h-4 w-4 text-[#B8860B]" />

                      <span className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">
                        Ingressos
                      </span>

                      <div className="flex-1 h-px bg-[#B8860B30]" />
                    </div>

                    {tickets.map((item, id) => (
                      <CartItemCard
                        item={item}
                        key={id}
                        handleIncreaseItemQuantity={handleIncreaseItemQuantity}
                        handleDecreaseItemQuantity={handleDecreaseItemQuantity}
                      />
                    ))}
                  </>
                )}

                {/* - Seção de Drinks - */}

                {drinks.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 w-[90%]">
                      <FaWineGlassAlt className="h-4 w-4 text-[#B8860B]" />

                      <span className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">
                        Drinks
                      </span>

                      <div className="flex-1 h-px bg-[#B8860B30]" />
                    </div>

                    {drinks.map((item) => (
                      <CartItemCard
                        item={item}
                        handleIncreaseItemQuantity={handleIncreaseItemQuantity}
                        handleDecreaseItemQuantity={handleDecreaseItemQuantity}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            {/* - Limpar carrinho - */}

            <button
              className="text-sm text-white/60 hover:bg-linear-to-br hover:underline hover:bg-clip-text hover:text-transparent hover:from-yellow-500 hover:via-yellow-600 to-yellow-700 font-semibold pb-5 cursor-pointer"
              onClick={handleClearCart}
            >
              Limpar Carrinho
            </button>

            {/* - Footer do carrinho - */}

            <div className="flex flex-col p-4 justify-start w-full bg-black border-t border-[#B8860B60]">
              {/* - Subtotal - */}

              <div className="flex justify-between w-full">
                <span className="text-white/60 text-sm font-semibold">
                  Subtotal
                </span>

                {cartItems.length >= 1 && (
                  <span className="text-white text-sm font-semibold">
                    R$ {totalItemPrice.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>

              {/* - Taxa de serviço - */}

              <div className="flex justify-between w-full">
                <span className="text-white/60 text-sm font-semibold pb-4">
                  Taxa de serviço
                </span>

                {cartItems.length >= 1 && (
                  <span className="text-white text-sm font-semibold">
                    R$ {serviceFee.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>

              {/* - Total - */}

              <div className="flex py-4 justify-between w-full border-t border-[#B8860B60]">
                <span className="text-white text-sm font-semibold">Total</span>

                {cartItems.length >= 1 && (
                  <span className="text-[#B8860B] text-sm font-semibold">
                    R$ {totalPrice.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>

              {/* - Botão - */}

              <motion.button
                className="flex justify-center px-4 py-2 text-[#B8860B] font-semibold bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-lg gap-2 cursor-pointer hover:shadow-sm shadow-[#DDAE56]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GiTicket className="w-6 h-6" />
                Finalizar Compra
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { CartDrawer };
