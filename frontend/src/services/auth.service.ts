/**
 * Serviço de autenticação
 * Responsável por chamadas à API relacionadas a autenticação
 */

import { api } from './api';
import { LoginRequest, LoginResponse, User } from '@/types/auth';

export const authService = {
  /**
   * Realiza login do usuário
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login/', credentials);
    return response.data;
  },

  /**
   * Realiza logout do usuário (blacklist do refresh token)
   */
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout/', { refresh_token: refreshToken });
  },

  /**
   * Obtém dados do usuário logado
   */
  me: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me/');
    return response.data;
  },

  /**
   * Atualiza o access token usando o refresh token
   */
  refreshToken: async (refreshToken: string): Promise<{ access: string; refresh: string }> => {
    const response = await api.post('/auth/refresh/', { refresh: refreshToken });
    return response.data;
  },
};