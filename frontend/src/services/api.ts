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

// Interceptor para adicionar token de autenticação (preparado para o futuro)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros globalmente (preparado para o futuro)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (não autorizado), redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    
    // Log de erros em desenvolvimento
    if (config.isDev) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);
