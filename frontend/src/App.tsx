import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/layout/Sidebar';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          
          <main className="flex-1 p-4 sm:ml-14">
            <Routes>
              <Route path="/" element={
                <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;