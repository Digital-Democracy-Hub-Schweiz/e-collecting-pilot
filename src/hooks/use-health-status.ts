import { useQuery } from "@tanstack/react-query";
import { healthAPI, HealthStatus } from "@/services/healthAPI";

export const useHealthStatus = () => {
  return useQuery<HealthStatus>({
    queryKey: ["health-status"],
    queryFn: () => healthAPI.getHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};