import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContaPagar } from '@/types/contasPagar';
import { ContasPagarDetails } from '@/components/contas_pagar/ContasPagarDetails';
import { ProximosAcordosCard } from '@/components/dashboard/ProximosAcordosCard';
import { ResumoAcordosCard } from '@/components/dashboard/ResumoAcordosCard';
import { GraficoSemanasCard } from '@/components/dashboard/GraficoSemanasCard';
import { useProximosAcordos } from '@/components/dashboard/hooks/useProximosAcordos';
import { useEstatisticasAcordos } from '@/components/dashboard/hooks/useEstatisticasAcordos';
import { LayoutDashboard, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardContasPagar() {
  const navigate = useNavigate();
  const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hooks customizados para buscar dados
  const { contas, loading: loadingContas, refetch: refetchContas } = useProximosAcordos(10);
  const { estatisticas, loading: loadingEstatisticas, refetch: refetchEstatisticas } = useEstatisticasAcordos();

  const handleViewDetails = (conta: ContaPagar) => {
    setSelectedConta(conta);
    setDrawerOpen(true);
  };

  const handleRefresh = async () => {
    await Promise.all([refetchContas(), refetchEstatisticas()]);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Aguarda um pouco antes de limpar para evitar flash visual
    setTimeout(() => setSelectedConta(null), 300);
  };

  const handlePagamentoConfirmado = async () => {
    // Atualiza todos os dados após pagamento
    await handleRefresh();
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8" />
            Dashboard Financeiro
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe suas contas recorrentes e os próximos pagamentos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loadingContas || loadingEstatisticas}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingContas || loadingEstatisticas ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/contas-pagar')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Acordo
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <ResumoAcordosCard
        totalAcordos={estatisticas.totalAcordos}
        proximoVencimento={estatisticas.proximoVencimento}
        totalValorMes={estatisticas.totalValorMes}
        loading={loadingEstatisticas}
      />

      {/* Gráfico de Pagamentos por Semana */}
      <GraficoSemanasCard
        contas={contas}
        loading={loadingContas}
      />

      {/* Lista de Próximos Acordos */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ProximosAcordosCard
          contas={contas}
          loading={loadingContas}
          onViewDetails={handleViewDetails}
        />

        {/* Card de Ações Rápidas (placeholder para futuras funcionalidades) */}
        <div className="space-y-4">
          {/* Você pode adicionar mais cards aqui no futuro, como: */}
          {/* - Histórico de pagamentos recentes */}
          {/* - Alertas e notificações */}
          {/* - Comparativo mensal */}

          <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
            <p className="text-sm">
              Espaço reservado para futuras funcionalidades
            </p>
            <p className="text-xs mt-2">
              Ex: Histórico, alertas, comparativos
            </p>
          </div>
        </div>
      </div>

      {/* Drawer de Detalhes */}
      <ContasPagarDetails
        conta={selectedConta}
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
        onPagamentoConfirmado={handlePagamentoConfirmado}
      />
    </div>
  );
}
