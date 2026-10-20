"use client";

import { getMyVouchers } from "@/actions/users/vouchers/getMyVouchers";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useQuery } from "@tanstack/react-query";

const useVouchers = () => {
  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const {
    data: vouchersResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vouchers"],
    queryFn: getMyVouchers,
    enabled: isAuthenticated,
  });

  // 1. A action devolve false quando falha, então a lista vira vazia para quem consome

  const vouchers = vouchersResult ? vouchersResult : [];

  return {
    /* - Query de leitura - */

    vouchers,
    isLoading,
    error,
  };
};

export { useVouchers };
