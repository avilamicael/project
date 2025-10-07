import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from "@/components/ui/sonner"
import { Login } from '@/pages/Login';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useBreadcrumb } from '@/hooks/useBreadcrumb';

import ContasPagarPage from '@/pages/contas_paga/ContasPaga';

// Componente para o Header com Breadcrumb dinâmico
function AppHeader() {
  const breadcrumbs = useBreadcrumb();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                {item.href ? (
                  <BreadcrumbLink href={item.href}>
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rota pública - Login */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <AppHeader />

                      <div className="flex flex-1 flex-col gap-4 p-4">
                        <Routes>
                          <Route path="/" element={
                            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-6">
                              {/* Ícone de construção */}
                              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-10 h-10 text-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </div>

                              {/* Mensagem principal */}
                              <div className="space-y-4 max-w-md">
                                <h1 className="text-3xl font-bold tracking-tight">
                                  Estou em Desenvolvimento
                                </h1>

                                <p className="text-sm text-muted-foreground">
                                  Aguarde novas atualizações!
                                </p>
                              </div>

                              {/* Indicador de status */}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span>Desenvolvimento em andamento</span>
                              </div>
                            </div>
                          } />

                          {/* Rota para Contas a Pagar */}
                          <Route path="/contas-pagar" element={<ContasPagarPage />} />

                          {/* Adicione mais rotas protegidas aqui */}
                        </Routes>
                      </div>
                    </SidebarInset>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;