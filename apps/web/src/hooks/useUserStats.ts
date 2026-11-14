import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { UserStatsDto } from '@tpomodoro/contracts';
import { useAuth } from './useAuth';

export const useUserStats = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<UserStatsDto>({
    queryKey: ['user', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<UserStatsDto>('/user/stats');
      return response.data;
    },
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 10000 : false,
    retry: false,
  });
};
