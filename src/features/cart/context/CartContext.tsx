"use client";

import { cartItemSchema, checkoutCartSchema } from "@/lib/validations/cart/cartItemSchemas";
import { createContext, useMemo, useState } from "react";
import { useCartItems } from "@/features/cart/hooks/useCartItems";
import type { CartItemProps } from "../types/cartItem";
import type z from "zod";
import { serviceFee } from "../utils/serviceFee";

interface CartContextType {
  /* - Dados do carrinho - */

  cartItems: CartItemProps[];
  isLoading: boolean;
  error: Error | null;

  /* - Estados do carrinho - */

  isCartOpen: boolean;
  setIsCartOpen: (isCartOpen: boolean) => void;

  /* - Definições - */

  totalItems: number;
  totalItemPrice: number;
  serviceFee: number;
  totalPrice: number;

  /* - Funções - */

  handleAddToCart: (item: z.infer<typeof cartItemSchema>) => Promise<boolean>;
  handleRemoveFromCart: (cartItemId: string) => Promise<void>;
  handleIncreaseItemQuantity: (item: CartItemProps) => Promise<void>;
  handleDecreaseItemQuantity: (item: CartItemProps) => Promise<void>;
  handleClearCart: () => Promise<void>;
  handleCheckout: (checkout: z.infer<typeof checkoutCartSchema>) => Promise<{ ticketOrderId: string | null; voucherOrderId: string | null } | false>;
  handleOpenCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CartProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Dados do carrinho - */

  const {
    cartItems: fetchedCartItems,
    isLoading,
    error,
    addItemToCartMutation,
    updateItemQuantityMutation,
    removeItemFromCartMutation,
    clearCartMutation,
    checkoutCartMutation,
  } = useCartItems();

  /* - Estados do carrinho - */

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  /* - Definições - */

  const cartItems = useMemo(() => fetchedCartItems ?? [], [fetchedCartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((accumulator, item) => accumulator + item.quantity, 0);
  }, [cartItems]);

  const totalItemPrice = useMemo(() => {
    return cartItems.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0);
  }, [cartItems]);

  const transactionWithServiceFee = totalItemPrice * serviceFee;
  const totalPrice = totalItemPrice + transactionWithServiceFee;

  /* - Funções - */

  // 1. Adiciona um item no carrinho (se ele já estiver lá, a action soma a quantidade)

  const handleAddToCart = async (item: z.infer<typeof cartItemSchema>) => {
    const addItemToCartResult = await addItemToCartMutation(item);

    return addItemToCartResult ? true : false;
  };

  // 2. Remove um item específico do carrinho

  const handleRemoveFromCart = async (cartItemId: string) => {
    await removeItemFromCartMutation(cartItemId);
  };

  // 3. Aumenta a quantidade de um item específico do carrinho

  const handleIncreaseItemQuantity = async (item: CartItemProps) => {
    await updateItemQuantityMutation({ cartItemId: item.id, quantity: item.quantity + 1 });
  };

  // 4. Diminui a quantidade de um item específico do carrinho (com 1 unidade, remove o item)

  const handleDecreaseItemQuantity = async (item: CartItemProps) => {
    if (item.quantity === 1) {
      await handleRemoveFromCart(item.id);
      return;
    }

    await updateItemQuantityMutation({ cartItemId: item.id, quantity: item.quantity - 1 });
  };

  // 5. Remove todos os itens do carrinho

  const handleClearCart = async () => {
    await clearCartMutation();
  };

  // 6. Finaliza a compra

  const handleCheckout = async (checkout: z.infer<typeof checkoutCartSchema>) => {
    return await checkoutCartMutation(checkout);
  };

  // 7. Abre e fecha o carrinho

  const handleOpenCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider
      value={{
        /* - Dados do carrinho - */

        cartItems,
        isLoading,
        error,

        /* - Estados do carrinho - */

        isCartOpen,
        setIsCartOpen,

        /* - Definições - */

        totalItems,
        totalItemPrice,
        serviceFee,
        totalPrice,

        /* - Funções - */

        handleAddToCart,
        handleRemoveFromCart,
        handleIncreaseItemQuantity,
        handleDecreaseItemQuantity,
        handleClearCart,
        handleCheckout,
        handleOpenCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };
