import { useState, useEffect } from "react";
import { type ReviewWithDetails } from "../types/reviews";
import { getReviews } from "../services/reviewServices";

const useReviews = () => {
  /* - Estados das avaliações - */

  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);

  /* - Estados de carregamento - */

  const [isLoading, setIsLoading] = useState<boolean>(false);

  /* - Estados de erro - */

  const [error, setError] = useState<string>("");

  /* - Definições - */

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (accumulator, review) => accumulator + review.rating,
          0,
        ) / reviews.length
      : 0;

  /* - Funções - */

  // 1. Busca as avaliações no momento em que a página renderiza

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviews();
        setReviews(data);
      } catch (error) {
        setError("Erro ao buscar eventos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return { reviews, isLoading, error, averageRating };
};

export { useReviews };
