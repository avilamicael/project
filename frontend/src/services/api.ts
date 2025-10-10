/**
 * Configuração base do Axios para chamadas à API
 * 
 * IMPORTANTE: Instale o axios primeiro:
 * npm install axios
 */

import axios from 'axios';
import { config } from '@/config/env';

// Cria instância do axios com configurações padrão
export const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função auxiliar para obter item do storage correto
const getStorageItem = (key: string): string | null => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = getStorageItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variável para controlar requisições em fila durante refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor para tratar erros globalmente e tentar refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se receber 401 (não autorizado) e ainda não tentou refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está fazendo refresh, adicionar na fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStorageItem('refresh_token');

      if (!refreshToken) {
        // Não tem refresh token, fazer logout
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Tentar fazer refresh do token
        const response = await api.post('/auth/refresh/', { refresh: refreshToken });
        const { access, refresh } = response.data;

        // Salvar novos tokens no storage correto
        const rememberMe = getStorageItem('remember_me') === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('access_token', access);
        storage.setItem('refresh_token', refresh);

        // Atualizar header da requisição original
        originalRequest.headers['Authorization'] = 'Bearer ' + access;

        // Processar fila de requisições que falharam
        processQueue(null, access);

        isRefreshing = false;

        // Tentar novamente a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, limpar tudo e fazer logout
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('remember_me');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('remember_me');

        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Log de erros em desenvolvimento
    if (config.isDev) {
      console.error('API Error:', error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);
