/**
 * Configurações centralizadas da aplicação
 * Usa variáveis de ambiente do Create React App (prefixo REACT_APP_)
 */

export const config = {
  // URL base da API
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  
  // Nome da aplicação
  appName: process.env.REACT_APP_NAME || 'SyncWave',
  
  // Ambiente
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;
