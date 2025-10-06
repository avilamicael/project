/**
 * Tipos TypeScript compartilhados
 * Adicione novos tipos conforme precisar
 */

// Tipo genérico para respostas da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Tipo para respostas paginadas (comum no Django REST Framework)
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Tipo para usuário (adapte conforme seu modelo Django)
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// Exportar tipos de autenticação
export * from './auth';
