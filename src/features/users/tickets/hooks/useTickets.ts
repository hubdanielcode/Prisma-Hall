"use client";

import { getTickets, TicketProps } from "@/features/users/tickets";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useState, useEffect } from "react";

const useTickets = () => {
  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Estados de tickets - */

  const [tickets, setTickets] = useState<TicketProps[]>([]);

  /* - Estados de carregamento - */

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* - Estados de erro - */

  const [error, setError] = useState<string | null>(null);

  /* - Funções - */

  // 1. Busca a sessão do usuário na hora da renderização

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // 2. Busca os ingressos comprados pelo usuário logado

    const fetchTickets = async () => {
      try {
        const data = await getTickets();
        setTickets(data);
      } catch (error) {
        setError("Erro ao buscar ingressos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated]);

  return { tickets, isLoading, error };
};

export { useTickets };
