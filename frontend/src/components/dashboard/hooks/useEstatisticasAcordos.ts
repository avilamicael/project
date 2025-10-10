import { useState, useEffect } from 'react';
import { contasPagarService } from '@/services/contas-pagar.service';

interface EstatisticasAcordos {
  totalAcordos: number;
  proximoVencimento?: {
    descricao: string;
    data: string | Date;
    valor: number;
  };
  totalValorMes: number;
}

export function useEstatisticasAcordos() {
  const [estatisticas, setEstatisticas] = useState<EstatisticasAcordos>({
    totalAcordos: 0,
    totalValorMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstatisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contasPagarService.estatisticasRecorrentes();

      setEstatisticas({
        totalAcordos: data.total_acordos,
        proximoVencimento: data.proximo_vencimento ? {
          descricao: data.proximo_vencimento.descricao,
          data: data.proximo_vencimento.data_vencimento,
          valor: typeof data.proximo_vencimento.valor_original === 'string'
            ? parseFloat(data.proximo_vencimento.valor_original)
            : data.proximo_vencimento.valor_original
        } : undefined,
        totalValorMes: data.total_valor_mes
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar estatísticas');
      console.error('Erro ao buscar estatísticas de acordos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstatisticas();
  }, []);

  return {
    estatisticas,
    loading,
    error,
    refetch: fetchEstatisticas
  };
}
