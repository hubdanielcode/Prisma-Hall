import { supabase, supabaseTemp } from "../../../../supabase/supabase";
import { type CartItem } from "../types/cartItem";

/* - Checa o rememberMe para decidir qual client usar - */

const getClient = () => {
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  return rememberMe ? supabase : supabaseTemp;
};

/* - C.R.U.D do carrinho - */

// 1. Create - Aka. Adicionar um item no carrinho

const createCartItem = async (item: CartItem) => {
  const client = getClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  if (item.type === "drinks") {
    const { data, error } = await client
      .from("cart")
      .insert({
        user_id: user.id,
        product_id: item.product_id,
        type: item.type,
        quantity: item.quantity,
        price: item.price,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error("Erro ao adicionar produto ao carrinho.");
    }

    return data;
  }

  const { data, error } = await client
    .from("cart")
    .insert({
      user_id: user.id,
      event_id: item.event_id,
      type: item.type,
      quantity: item.quantity,
      price: item.price,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Erro ao adicionar produto ao carrinho.");
  }

  return data;
};

// 2. Read - Aka. Buscar os itens do carrinho do usuário logado

const getCartItems = async () => {
  const client = getClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await client
    .from("cart")
    .select(`*, events(*), products(*)`)
    .eq("user_id", user.id);

  if (error) {
    console.log(error);
    throw new Error("Falha ao buscar itens do carrinho.");
  }
  return data.map((item) => ({
    ...item,
    ...(item.events ?? {}),
    ...(item.products ?? {}),
  }));
};

// 3. Update - Aka. Atualizar a quantidade de um item específico no carrinho

const updateCartItem = async (
  id: string,
  updates: Partial<Omit<CartItem, "id" | "created_at">>,
) => {
  const client = getClient();
  const { data, error } = await client
    .from("cart")
    .update(updates)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Erro ao atualizar produto.");
  }
  return data;
};

// 4. Delete - Aka. Remover um item específico do carrinho

const deleteCartItem = async (id: string) => {
  const client = getClient();
  const { data, error } = await client
    .from("cart")
    .delete()
    .select("*")
    .eq("id", id);

  if (error) {
    throw new Error("Erro ao deletar produto.");
  }
  return data;
};

/* - Limpa o carrinho - */

const clearCartItems = async () => {
  const client = getClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await client
    .from("cart")
    .delete()
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Erro ao limpar o carrinho.");
  }

  return data;
};

export {
  createCartItem,
  getCartItems,
  updateCartItem,
  deleteCartItem,
  clearCartItems,
};
