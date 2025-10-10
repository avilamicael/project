import { useState, useEffect } from 'react';
import { ContaPagar } from '@/types/contasPagar';
import { contasPagarService } from '@/services/contas-pagar.service';

export function useProximosAcordos(limite: number = 10) {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contasPagarService.listarProximasRecorrentes(limite);
      setContas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar acordos');
      console.error('Erro ao buscar próximos acordos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limite]);

  return {
    contas,
    loading,
    error,
    refetch: fetchContas
  };
}
