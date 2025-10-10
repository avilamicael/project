/**
 * Context de Autenticação
 * Gerencia o estado de autenticação da aplicação
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const refreshTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Funções auxiliares para trabalhar com storage dinâmico
  const getStorageItem = (key: string): string | null => {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  };

  const setStorageItem = (key: string, value: string) => {
    const rememberMe = getStorageItem('remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(key, value);
  };

  const clearStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('remember_me');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('remember_me');
  };

  // Verifica se há um usuário logado ao carregar a aplicação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const accessToken = getStorageItem('access_token');

    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authService.me();
      setUser(userData);

      // Configurar refresh automático se estiver autenticado
      setupTokenRefresh();
    } catch (error) {
      // Token inválido ou expirado, tentar refresh
      const refreshTokenValue = getStorageItem('refresh_token');

      if (refreshTokenValue) {
        try {
          await refreshToken();
          const userData = await authService.me();
          setUser(userData);
        } catch (refreshError) {
          // Refresh também falhou, limpar tudo
          clearStorage();
        }
      } else {
        clearStorage();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await authService.login({ email, password, remember_me: rememberMe });

      // Salvar tokens no localStorage ou sessionStorage baseado em rememberMe
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', response.access);
      storage.setItem('refresh_token', response.refresh);
      storage.setItem('remember_me', rememberMe.toString());

      // Buscar dados completos do usuário
      const userData = await authService.me();
      setUser(userData);

      // Configurar refresh automático do token (14 minutos se token expira em 15min)
      setupTokenRefresh();

      // Redirecionar para o dashboard
      navigate('/');
    } catch (error: any) {
      // Lançar erro para ser tratado no componente de login
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const logout = async () => {
    const refreshToken = getStorageItem('refresh_token');

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar timer de refresh
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      // Limpar estado e storage
      clearStorage();
      setUser(null);
      navigate('/login');
    }
  };

  const refreshToken = async () => {
    const refreshToken = getStorageItem('refresh_token');

    if (!refreshToken) {
      throw new Error('Refresh token não encontrado');
    }

    try {
      const response = await authService.refreshToken(refreshToken);
      setStorageItem('access_token', response.access);
      setStorageItem('refresh_token', response.refresh);

      // Reconfigurar o próximo refresh automático
      setupTokenRefresh();
    } catch (error) {
      // Refresh token inválido, fazer logout
      await logout();
      throw error;
    }
  };

  // Configurar refresh automático do token
  const setupTokenRefresh = () => {
    // Limpar timer anterior se existir
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Refresh a cada 14 minutos (assumindo que o token expira em 15 minutos)
    // Ajuste este tempo conforme a configuração do seu backend
    const refreshInterval = 14 * 60 * 1000; // 14 minutos em milissegundos

    refreshTimerRef.current = setTimeout(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Erro ao renovar token automaticamente:', error);
      }
    }, refreshInterval);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};