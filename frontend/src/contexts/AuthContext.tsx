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

  // Verifica se há um usuário logado ao carregar a aplicação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authService.me();
      setUser(userData);
    } catch (error) {
      // Token inválido ou expirado
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      // Salvar tokens no localStorage
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);

      // Buscar dados completos do usuário
      const userData = await authService.me();
      setUser(userData);

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
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar estado e localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('Refresh token não encontrado');
    }

    try {
      const response = await authService.refreshToken(refreshToken);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
    } catch (error) {
      // Refresh token inválido, fazer logout
      await logout();
      throw error;
    }
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