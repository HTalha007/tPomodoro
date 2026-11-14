import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { RoundResponseDto } from '@tpomodoro/contracts';

export const useResumeRound = () => {
  const queryClient = useQueryClient();

  return useMutation<RoundResponseDto, Error>({
    mutationFn: async () => {
      const response = await apiClient.post<RoundResponseDto>('/rounds/resume');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['session', 'current'], {
        hasActiveRound: true,
        round: data,
        serverNow: data.serverNow,
      });
      queryClient.invalidateQueries({ queryKey: ['session', 'current'] });
    },
  });
};
