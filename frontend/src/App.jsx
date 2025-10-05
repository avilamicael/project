import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Projeto Django + React + Nginx
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Pronto para usar componentes do Untitled UI
          </p>
        </div>

        {/* Card de Boas-vindas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            🎉 Projeto Configurado!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Seu ambiente está pronto para começar a adicionar componentes do Untitled UI.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Tailwind CSS Configurado
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Com paleta de cores do Untitled UI
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Dependências Instaladas
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Headless UI, Heroicons, clsx, tailwind-merge
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Estrutura de Pastas Pronta
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  src/components/ui/ e src/lib/
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            📋 Próximos Passos
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>Acesse: https://www.untitledui.com/react/components</li>
            <li>Escolha o componente que precisa (Button, Input, Select, etc)</li>
            <li>Copie o código e cole em <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">src/components/ui/</code></li>
            <li>Adicione a exportação em <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">index.js</code></li>
            <li>Importe e use: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">import &#123; Button &#125; from '@/components/ui'</code></li>
          </ol>
        </div>

        {/* Teste de Cores */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">
            Primary
          </div>
          <div className="bg-gray-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">
            Gray
          </div>
          <div className="bg-green-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">
            Success
          </div>
          <div className="bg-red-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">
            Danger
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
