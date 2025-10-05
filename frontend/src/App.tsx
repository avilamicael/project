import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Projeto TypeScript + Shadcn UI
            </h1>
            <p className="text-xl text-muted-foreground">
              Pronto para desenvolvimento profissional!
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Configurações Completas</h2>
            
            <div className="flex gap-4 justify-center mb-6">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Input type='email' placeholder='Email' />
            </div>

            <ul className="space-y-3 text-left max-w-md mx-auto">
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>TypeScript configurado</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Tailwind CSS instalado</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Shadcn UI funcionando</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Docker configurado</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Alias @ funcionando</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Próximos Passos</h3>
            <ol className="text-sm text-left max-w-2xl mx-auto space-y-2 list-decimal list-inside">
              <li>
                Adicionar componentes: 
                <code className="ml-2 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">
                  npx shadcn@latest add input
                </code>
              </li>
              <li>
                Importar: 
                <code className="ml-2 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">
                  import &#123; Input &#125; from "@/components/ui/input"
                </code>
              </li>
              <li>
                Agora todos os componentes funcionarão automaticamente!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
