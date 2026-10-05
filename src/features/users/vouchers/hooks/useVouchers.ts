"use client";

import { getMyVouchers } from "@/actions";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useQuery } from "@tanstack/react-query";

const useVouchers = () => {
  /* - Puxando do context - */

  const { isAuthenticated } = useAuthenticationContext();

  /* - Query de leitura - */

  const {
    data: vouchers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vouchers"],
    queryFn: getMyVouchers,
    enabled: isAuthenticated,
  });

  return {
    /* - Query de leitura - */

    vouchers,
    isLoading,
    error,
  };
};

export { useVouchers };
