import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { CurrentSessionResponseDto } from '@tpomodoro/contracts';
import { useAuth } from './useAuth';

export const useCurrentSession = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<CurrentSessionResponseDto>({
    queryKey: ['session', 'current'],
    queryFn: async () => {
      const response = await apiClient.get<CurrentSessionResponseDto>('/session/current');
      return response.data;
    },
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 5000 : false,
    retry: false,
  });
};
