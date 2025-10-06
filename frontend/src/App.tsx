import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
                      Conteúdo da página aqui...
                    </p>
                  </div>
                } />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;