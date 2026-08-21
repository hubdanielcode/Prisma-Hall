import { supabase, supabaseTemp } from "../../../../../supabase/supabase";
import { type EventProps } from "../types/event";

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

/* - C.R.U.D dos eventos - */

// 1. Create

const createEvent = async (event: Omit<EventProps, "created_at" | "id">) => {
  await checkIsAdmin();
  const client = getClient();

  const { data, error } = await client
    .from("events")
    .insert(event)
    .select("*")
    .single();

  if (error) {
    throw new Error("Erro ao criar novo evento.");
  }

  return data;
};

// 2. Read

const getEvents = async () => {
  const client = getClient();
  const { data, error } = await client.from("events").select("*");

  if (error) {
    throw new Error("Erro ao buscar eventos.");
  }

  return data;
};

const getSingleEvent = async (event_id: string) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_id", event_id)
    .single();

  if (error) {
    throw new Error("Erro ao buscar evento.");
  }

  return data;
};

// 3. Update

const updateEvent = async (
  event_id: string,
  updates: Partial<Omit<EventProps, "created_at" | "id">>,
) => {
  await checkIsAdmin();
  const client = getClient();

  const { data, error } = await client
    .from("events")
    .update(updates)
    .eq("event_id", event_id)
    .select("*")
    .single();

  if (error) {
    throw new Error("Erro ao atualizar evento.");
  }

  return data;
};

// 4. Delete

const deleteEvent = async (event_id: string) => {
  await checkIsAdmin();
  const client = getClient();

  const { data, error } = await client
    .from("events")
    .delete()
    .eq("event_id", event_id)
    .select("*")
    .single();

  if (error) {
    throw new Error("Erro ao deletar evento.");
  }

  return data;
};

export {
  checkIsAdmin,
  createEvent,
  getEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
};
