import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pessoas" element={<h2>Gestão de Pessoas</h2>} />
          <Route path="/financeiro" element={<h2>Financeiro</h2>} />
          <Route path="/whatsapp" element={<h2>Whatsapp</h2>} />
          <Route path="/configuracoes" element={<h2>Configurações</h2>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;