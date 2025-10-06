import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Login } from '@/pages/Login';

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
                  <div className="flex min-h-screen w-full">
                    <Sidebar />
                    
                    <div className="flex flex-1 flex-col sm:ml-14">
                      <Header />
                      
                      <main className="flex-1 p-4">
                        <Routes>
                          <Route path="/" element={
                            <div>
                              <h1 className="text-2xl font-bold">Bem-vindo ao Dashboard</h1>
                              <p className="text-muted-foreground mt-2">
                                Você está logado com sucesso!
                              </p>
                            </div>
                          } />
                          
                          {/* Adicione mais rotas protegidas aqui */}
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;