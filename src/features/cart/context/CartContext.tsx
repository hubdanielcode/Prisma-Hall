import { createContext, useMemo, useState, useEffect } from "react";
import type { CartItem } from "../types/cartItem";
import {
  createCartItem,
  getCartItems,
  updateCartItem,
  deleteCartItem,
  clearCartItems,
} from "@/features/cart/services/cartServices";

interface CartContextType {
  /* - Estados dos itens - */

  cartItems: CartItem[];

  /* - Estados do carrinho - */

  isCartOpen: boolean;
  setIsCartOpen: (isCartOpen: boolean) => void;

  /* - Estados de carregamento - */

  isLoading: boolean;

  /* - Estados de erro - */

  error: string;

  /* - Definições - */

  totalItems: number;
  totalItemPrice: number;
  serviceFee: number;
  totalPrice: number;

  /* - Funções - */

  handleIsAlreadyOnCart: (item: CartItem) => boolean;
  handleAddToCart: (item: CartItem) => void;
  handleRemoveFromCart: (id: string) => void;
  handleIncreaseItemQuantity: (item: CartItem) => void;
  handleDecreaseItemQuantity: (item: CartItem) => void;
  handleClearCart: () => void;
  handleOpenCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CartProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Estados dos itens - */

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /* - Estados do carrinho - */

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  /* - Estados de carregamento - */

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* - Estados de erro - */

  const [error, setError] = useState<string>("");

  /* - Definições - */

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (accumulator, item) => accumulator + item.quantity,
      0,
    );
  }, [cartItems]);

  const totalItemPrice = useMemo(() => {
    return cartItems.reduce(
      (accumulator, item) => accumulator + item.price * item.quantity,
      0,
    );
  }, [cartItems]);

  const serviceFee = totalItemPrice * 0.1;
  const totalPrice = totalItemPrice + serviceFee;

  /* - Funções - */

  // 1. Busca os itens do carrinho no momento da renderização

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const data = await getCartItems();
        setCartItems(data as CartItem[]);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartItems();
  }, []);

  // 2. Verifica se um item já existe no carrinho

  const handleIsAlreadyOnCart = (item: CartItem): boolean => {
    return cartItems.some((cartItem) =>
      item.type === "drinks" && cartItem.type === "drinks"
        ? item.product_id === cartItem.product_id
        : item.type === "tickets" && cartItem.type === "tickets"
          ? item.event_id === cartItem.event_id
          : false,
    );
  };

  // 3. Adiciona um item no carrinho

  const handleAddToCart = async (item: CartItem) => {
    if (handleIsAlreadyOnCart(item)) {
      await handleIncreaseItemQuantity(item);
      return;
    }

    await createCartItem(item);
    const updatedCart = await getCartItems();
    setCartItems(updatedCart as CartItem[]);
  };

  // 4. Remove um item específico do carrinho

  const handleRemoveFromCart = async (id: string) => {
    await deleteCartItem(id);
    setCartItems(cartItems.filter((cartItem) => cartItem.id !== id));
  };

  // 5. Aumenta a quantidade de um item específico do carrinho

  const handleIncreaseItemQuantity = async (item: CartItem) => {
    const itemToUpdate = cartItems.find((cartItem) =>
      cartItem.type === "drinks" && item.type === "drinks"
        ? cartItem.product_id === item.product_id
        : cartItem.type === "tickets" && item.type === "tickets"
          ? cartItem.event_id === item.event_id
          : false,
    );

    if (!itemToUpdate) {
      return;
    }

    await updateCartItem(itemToUpdate.id, {
      quantity: itemToUpdate.quantity + 1,
    });
    setCartItems(
      cartItems.map((cartItem) =>
        cartItem.id === itemToUpdate.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      ),
    );
  };

  // 6. Diminui a quantidade de um item específico do carrinho

  const handleDecreaseItemQuantity = async (item: CartItem) => {
    const itemToUpdate = cartItems.find((cartItem) =>
      cartItem.type === "drinks" && item.type === "drinks"
        ? cartItem.product_id === item.product_id
        : cartItem.type === "tickets" && item.type === "tickets"
          ? cartItem.event_id === item.event_id
          : false,
    );

    if (!itemToUpdate) {
      return;
    }

    if (itemToUpdate.quantity === 1) {
      await handleRemoveFromCart(itemToUpdate.id);
      return;
    }

    await updateCartItem(itemToUpdate.id, {
      quantity: itemToUpdate.quantity - 1,
    });
    setCartItems(
      cartItems.map((cartItem) =>
        cartItem.id === itemToUpdate.id
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem,
      ),
    );
  };

  // 7. Remove todos os itens do carrinho

  const handleClearCart = async () => {
    await clearCartItems();
    setCartItems([]);
  };

  // 8. Abre e fecha o carrinho

  const handleOpenCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider
      value={{
        /* - Estados dos itens - */

        cartItems,

        /* - Estados do carrinho - */

        isCartOpen,
        setIsCartOpen,

        /* - Estados de carregamento - */

        isLoading,

        /* - Estados de erro - */

        error,

        /* - Definições - */

        totalItems,
        totalItemPrice,
        serviceFee,
        totalPrice,

        /* - Funções - */

        handleIsAlreadyOnCart,
        handleAddToCart,
        handleRemoveFromCart,
        handleIncreaseItemQuantity,
        handleDecreaseItemQuantity,
        handleClearCart,
        handleOpenCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };
