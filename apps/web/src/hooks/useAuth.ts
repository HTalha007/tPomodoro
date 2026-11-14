import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { AccountDto, AuthResponseDto, LoginDto, RegisterDto } from '@tpomodoro/contracts';

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Check current session/account
  const { data, isLoading, isError } = useQuery<{ account: AccountDto }>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<{ account: AccountDto }>('/auth/me');
      return response.data;
    },
    retry: false,
    staleTime: 60000,
  });

  const account = data?.account ?? null;
  const isAuthenticated = !isError && !!account;

  // Login mutation
  const loginMutation = useMutation<AuthResponseDto, Error, LoginDto>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post<AuthResponseDto>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['session', 'current'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation<AuthResponseDto, Error, RegisterDto>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post<AuthResponseDto>('/auth/register', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['session', 'current'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<{ success: boolean }, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.post<{ success: boolean }>('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['session', 'current'] });
    },
  });

  return {
    account,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};
