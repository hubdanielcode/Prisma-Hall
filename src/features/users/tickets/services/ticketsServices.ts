import { supabase, supabaseTemp } from "../../../../../supabase/supabase";

/* - Definições - */

const getClient = () => {
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  return rememberMe ? supabase : supabaseTemp;
};

/* - C.R.U.D dos ingressos - */

// 1. Create

// 2. Read

const getTickets = async () => {
  const client = getClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await client
    .from("tickets")
    .select(`*, events (*)`)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Erro ao buscar ingressos.");
  }

  return data;
};

// 3. Update

// 4. Delete

export { getTickets };
