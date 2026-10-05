"use client";

import { getMyTickets } from "@/actions";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useQuery } from "@tanstack/react-query";

const useTickets = () => {
  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tickets"],
    queryFn: getMyTickets,
    enabled: isAuthenticated,
  });

  return {
    /* - Query de leitura - */

    tickets,
    isLoading,
    error,
  };
};

export { useTickets };
