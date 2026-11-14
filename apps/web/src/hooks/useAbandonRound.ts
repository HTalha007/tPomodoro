import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { RoundResponseDto } from '@tpomodoro/contracts';

export const useAbandonRound = () => {
  const queryClient = useQueryClient();

  return useMutation<RoundResponseDto, Error>({
    mutationFn: async () => {
      const response = await apiClient.post<RoundResponseDto>('/rounds/abandon');
      return response.data;
    },
    onSuccess: (data) => {
      // Mark session as inactive
      queryClient.setQueryData(['session', 'current'], {
        hasActiveRound: false,
        round: data,
        serverNow: data.serverNow,
      });
      // Invalidate user stats so today/this week/streak update immediately
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['session', 'current'] });
    },
  });
};
