import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function useBreadcrumb(): BreadcrumbItem[] {
  const location = useLocation();
  const path = location.pathname;

  // Mapa de rotas para breadcrumbs
  const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
    '/': [
      { label: 'Dashboard', href: '/' },
      { label: 'Início' }
    ],
    '/contas-pagar': [
      { label: 'Financeiro', href: '#' },
      { label: 'Contas a Pagar' }
    ],
    '/contas-pagar/listar': [
      { label: 'Financeiro', href: '#' },
      { label: 'Listar Contas a Pagar' }
    ],
    '/contas-pagar/dashboard': [
      { label: 'Financeiro', href: '#' },
      { label: 'Dashboard Financeiro' }
    ],
    // Adicione mais rotas aqui
  };

  return breadcrumbMap[path] || [
    { label: 'Dashboard', href: '/' },
    { label: 'Página' }
  ];
}