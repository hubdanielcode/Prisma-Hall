import { supabase, supabaseTemp } from "../../../../../supabase/supabase";
import type { ReviewProps, ReviewWithDetails } from "../types/reviews";

/* - Definições - */

const getClient = () => {
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  return rememberMe ? supabase : supabaseTemp;
};

/* - C.R.U.D das avaliações - */

// 1. Create

const createReview = async (
  review: Omit<ReviewProps, "created_at" | "review_id" | "user_id">,
) => {
  const client = getClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await client
    .from("reviews")
    .insert({
      user_id: user.id,
      event_id: review.event_id,
      rating: review.rating,
      comment: review.comment ?? null,
      verified: review.verified,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Erro ao avaliar o evento.");
  }

  return data;
};

// 2. Read

const getReviews = async () => {
  const client = getClient();

  const { data, error } = await client
    .from("reviews")
    .select(`*, events (title), users (name, photo)`);

  if (error) {
    throw new Error("Erro ao buscar avaliações");
  }

  return data.map((review) => ({
    ...review,
    event_name: review.events?.title ?? null,
    user_name: review.users?.name ?? null,
    user_photo: review.users?.photo ?? null,
  })) as ReviewWithDetails[];
};

const getSingleReview = async (review_id: string) => {
  const client = getClient();

  const { data, error } = await client
    .from("reviews")
    .select(`*, events (title), users (name, photo)`)
    .eq("review_id", review_id)
    .single();

  if (error) {
    throw new Error("Erro ao buscar avaliação.");
  }

  return {
    ...data,
    event_name: data.events?.title ?? null,
    user_name: data.users?.name ?? null,
    user_avatar: data.users?.photo ?? null,
  } as ReviewWithDetails;
};

// 3. Update

const updateReview = async (
  review_id: string,
  updates: Partial<Omit<ReviewProps, "created_at" | "review_id" | "user_id">>,
) => {
  const client = getClient();

  const { data, error } = await client
    .from("reviews")
    .update(updates)
    .select("*")
    .eq("review_id", review_id)
    .single();

  if (error) {
    throw new Error("Erro ao atualizar avaliação.");
  }

  return data;
};

// 4. Delete

const deleteReview = async (review_id: string) => {
  const client = getClient();

  const { data, error } = await client
    .from("reviews")
    .delete()
    .eq("review_id", review_id)
    .select("*")
    .single();

  if (error) {
    throw new Error("Erro ao deletar avaliação.");
  }

  return data;
};

export {
  createReview,
  getReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
