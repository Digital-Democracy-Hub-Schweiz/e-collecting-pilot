import { useQuery } from "@tanstack/react-query";
import { healthAPI, SystemHealth } from "@/services/healthAPI";

export const useHealthStatus = () => {
  return useQuery<SystemHealth>({
    queryKey: ["system-health-status"],
    queryFn: () => healthAPI.getSystemHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};