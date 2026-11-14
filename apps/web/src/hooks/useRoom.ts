import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { RoomResponseDto, JoinRoomDto } from '@tpomodoro/contracts';
import { useAuth } from './useAuth';

export const useActiveRoom = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useQuery<{ room: RoomResponseDto | null }>({
    queryKey: ['room', 'active'],
    queryFn: async () => {
      // If we already know the active roomId, call poll to heartbeat last_seen_at (AC-R10)
      const current = queryClient.getQueryData<{ room: RoomResponseDto | null }>(['room', 'active']);
      if (current?.room?.roomId) {
        try {
          const pollRes = await apiClient.post<RoomResponseDto>(`/rooms/${current.room.roomId}/poll`);
          return { room: pollRes.data };
        } catch {
          // If poll fails (e.g. room closed or membership ended), fall back to active check
        }
      }
      const response = await apiClient.get<{ room: RoomResponseDto | null }>('/rooms/active');
      return response.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 10000, // AC-R10: 10 seconds polling
    retry: false,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation<RoomResponseDto, Error>({
    mutationFn: async () => {
      const response = await apiClient.post<RoomResponseDto>('/rooms/create');
      return response.data;
    },
    onSuccess: (room) => {
      queryClient.setQueryData(['room', 'active'], { room });
      queryClient.invalidateQueries({ queryKey: ['room', 'active'] });
    },
  });
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();
  return useMutation<RoomResponseDto, Error, JoinRoomDto>({
    mutationFn: async (dto) => {
      const response = await apiClient.post<RoomResponseDto>('/rooms/join', dto);
      return response.data;
    },
    onSuccess: (room) => {
      queryClient.setQueryData(['room', 'active'], { room });
      queryClient.invalidateQueries({ queryKey: ['room', 'active'] });
    },
  });
};

export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error>({
    mutationFn: async () => {
      const response = await apiClient.post<{ success: boolean }>('/rooms/leave');
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['room', 'active'], { room: null });
      queryClient.invalidateQueries({ queryKey: ['room', 'active'] });
    },
  });
};
