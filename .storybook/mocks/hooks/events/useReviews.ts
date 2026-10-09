import { fn } from "storybook/test";
import type { ReviewWithDetails } from "@/features/events/reviews/types/reviews";

const fakeReviews: ReviewWithDetails[] = [
  {
    id: "id-da-avaliacao-fake-1",
    userId: "id-do-usuario-fake-1",
    eventId: "id-do-evento-2",
    rating: 5,
    comment: "Noite incrível, voltarei com certeza!",
    eventName: "Evento Fake 01",
    userName: "Maria Aparecida da Silva",
    userPhoto: null,
    verifiedBadge: true,

    createdAt: new Date("2026-08-01").toISOString(),
    updatedAt: new Date("2026-08-01").toISOString(),
  },

  {
    id: "id-da-avaliacao-fake-2",
    userId: "id-do-usuario-fake-2",
    eventId: "id-do-evento-3",
    rating: 4,
    comment: "Ótima estrutura e som de qualidade.",
    eventName: "Evento Fake 02",
    userName: "João Pedro Almeida",
    userPhoto: null,
    verifiedBadge: false,

    createdAt: new Date("2026-08-02").toISOString(),
    updatedAt: new Date("2026-08-02").toISOString(),
  },

  {
    id: "id-da-avaliacao-fake-3",
    userId: "id-do-usuario-fake-3",
    eventId: "id-do-evento-1",
    rating: 3,
    comment: null,
    eventName: "Evento Fake 03",
    userName: "Ana Clara Souza",
    userPhoto: null,
    verifiedBadge: false,

    createdAt: new Date("2026-08-03").toISOString(),
    updatedAt: new Date("2026-08-03").toISOString(),
  },

  {
    id: "id-da-avaliacao-fake-4",
    userId: "id-do-usuario-fake-4",
    eventId: "id-do-evento-2",
    rating: 5,
    comment: "Atendimento do bar muito rápido.",
    eventName: "Evento Fake 01",
    userName: "Carlos Eduardo Lima",
    userPhoto: null,
    verifiedBadge: true,

    createdAt: new Date("2026-08-04").toISOString(),
    updatedAt: new Date("2026-08-04").toISOString(),
  },

  {
    id: "id-da-avaliacao-fake-5",
    userId: "id-do-usuario-fake-5",
    eventId: "id-do-evento-3",
    rating: 4,
    comment: "Casa cheia, mas bem organizada.",
    eventName: "Evento Fake 02",
    userName: "Beatriz Santos",
    userPhoto: null,
    verifiedBadge: false,

    createdAt: new Date("2026-08-05").toISOString(),
    updatedAt: new Date("2026-08-05").toISOString(),
  },

  {
    id: "id-da-avaliacao-fake-6",
    userId: "id-do-usuario-fake-6",
    eventId: "id-do-evento-1",
    rating: 5,
    comment: "Melhor show do ano.",
    eventName: "Evento Fake 03",
    userName: "Rafael Costa",
    userPhoto: null,
    verifiedBadge: false,

    createdAt: new Date("2026-08-06").toISOString(),
    updatedAt: new Date("2026-08-06").toISOString(),
  },

  {
    id: "id-da-avaliacao-fake-7",
    userId: "id-do-usuario-fake-7",
    eventId: "id-do-evento-2",
    rating: 2,
    comment: "Fila de entrada demorada.",
    eventName: "Evento Fake 01",
    userName: "Fernanda Oliveira",
    userPhoto: null,
    verifiedBadge: false,

    createdAt: new Date("2026-08-07").toISOString(),
    updatedAt: new Date("2026-08-07").toISOString(),
  },
];

const fakeReview = fakeReviews[0];

const useReviews = () => ({
  reviews: fakeReviews,
  isLoading: false,
  error: null,
  averageRating: fakeReviews.reduce((accumulator, review) => accumulator + review.rating, 0) / fakeReviews.length,
  postReviewMutation: fn(async () => fakeReview),
  updateReviewMutation: fn(async () => fakeReview),
  deleteReviewMutation: fn(async () => true),
});

export { useReviews, fakeReviews, fakeReview };
