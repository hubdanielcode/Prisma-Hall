"use client";

import { getUsersStats } from "@/actions/admin/users-management/getUsersStats";
import { useQuery } from "@tanstack/react-query";

const useUsersStats = () => {
  /* - Query de leitura - */

  const { data: stats, isLoading, error } = useQuery({ queryKey: ["users-stats"], queryFn: getUsersStats });

  return { stats, isLoading, error };
};

export { useUsersStats };
