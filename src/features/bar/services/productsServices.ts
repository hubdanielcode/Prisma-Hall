import { supabase, supabaseTemp } from "../../../../supabase/supabase";
import { type ProductProps } from "@/features/bar";

/* - Checa o rememberMe para decidir qual client usar - */

const getClient = () => {
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  return rememberMe ? supabase : supabaseTemp;
};

/* - Verificando se o usuário é um administrador - */

const checkIsAdmin = async () => {
  const client = getClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await client
    .from("users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error || data?.role !== "admin") {
    throw new Error("Acesso negado: apenas admins podem realizar esta ação.");
  }
};

/* - C.R.U.D dos produtos - */

// 1. Create

const createProduct = async (
  product: Omit<ProductProps, "created_at" | "product_id">,
) => {
  await checkIsAdmin();
  const client = getClient();

  const { data, error } = await client
    .from("products")
    .insert(product)
    .select("*")
    .single();

  if (error) {
    throw new Error("Erro ao criar novo produto.");
  }

  return data;
};

// 2. Read

const getProducts = async () => {
  const client = getClient();
  const { data, error } = await client.from("products").select("*");

  if (error) {
    throw new Error("Erro ao buscar produtos.");
  }
  return data;
};

const getSingleProduct = async (product_id: string) => {
  const client = getClient();
  const { data, error } = await client
    .from("products")
    .select("*")
    .eq("product_id", product_id)
    .single();

  if (error) {
    throw new Error("Erro ao buscar produto.");
  }
  return data;
};

// 3. Update

const updateProduct = async (
  product_id: string,
  updates: Partial<Omit<ProductProps, "created_at" | "id">>,
) => {
  await checkIsAdmin();
  const client = getClient();

  const { data, error } = await client
    .from("products")
    .update(updates)
    .select("*")
    .eq("product_id", product_id)
    .single();

  if (error) {
    throw new Error("Erro ao atualizar produto.");
  }

  return data;
};

// 4. Delete

const deleteProduct = async (product_id: string) => {
  await checkIsAdmin();
  const client = getClient();

  const { data, error } = await client
    .from("products")
    .delete()
    .eq("product_id", product_id)
    .select("*")
    .single();

  if (error) {
    throw new Error("Erro ao deletar produto.");
  }

  return data;
};

export {
  checkIsAdmin,
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
