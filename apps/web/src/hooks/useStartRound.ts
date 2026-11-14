import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { RoundResponseDto, StartRoundDto } from '@tpomodoro/contracts';

export const useStartRound = () => {
  const queryClient = useQueryClient();

  return useMutation<RoundResponseDto, Error, StartRoundDto>({
    mutationFn: async (dto) => {
      const response = await apiClient.post<RoundResponseDto>('/rounds/start', dto);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate active session and user stats
      queryClient.setQueryData(['session', 'current'], {
        hasActiveRound: true,
        round: data,
        serverNow: data.serverNow,
      });
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['session', 'current'] });
    },
  });
};
