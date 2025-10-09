import { useState, useEffect, useCallback } from 'react';
import { contasPagarService } from '@/services/contas-pagar.service';
import { useToast } from '@/hooks/use-toast';
import type { ContaPagar, Options } from '@/types/contasPagar';

export function useContasPagar() {
  const { toast } = useToast();
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<Options>({} as Options);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchContas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contasPagarService.listar({ page });
      const contasData = response.results || response;

      const contasPadronizadas = contasData.map((conta: any) => ({
        ...conta,
        fornecedor_id: conta.fornecedor_id ?? conta.fornecedor,
        filial_id: conta.filial_id ?? conta.filial,
        categoria_id: conta.categoria_id ?? conta.categoria,
      }));

      setContas(contasPadronizadas);

      // Atualiza total de páginas e total de registros (25 por página, por exemplo)
      if (response.count) {
        const total = Math.ceil(response.count / 25);
        setTotalPages(total);
        setTotalCount(response.count);
      }
    } catch (error) {
      const e = error as any;
      toast({
        title: "Erro ao carregar contas",
        description: e?.message || String(error)
      });
    } finally {
      setLoading(false);
    }
  }, [page, toast]);



  const fetchOptions = useCallback(async () => {
    try {
      const [filiaisResp, categoriasResp, fornecedoresResp] = await Promise.all([
        fetch('/financeiro/filiais/'),
        fetch('/financeiro/categorias/'),
        fetch('/financeiro/fornecedores/')
      ]);

      if (!filiaisResp.ok || !categoriasResp.ok || !fornecedoresResp.ok) {
        toast({
          title: 'Erro ao carregar opções',
          description: 'Falha ao buscar dados de filiais, categorias ou fornecedores.'
        });
        return;
      }

      const [filiais, categorias, fornecedores] = await Promise.all([
        filiaisResp.json().catch(() => []),
        categoriasResp.json().catch(() => []),
        fornecedoresResp.json().catch(() => [])
      ]);

      setOptions({
        filiais: filiais.map((f: any) => ({ value: f.id, label: f.nome })),
        categorias: categorias.map((c: any) => ({ value: c.id, label: c.nome })),
        fornecedores: fornecedores.map((f: any) => ({ value: f.id, label: f.nome }))
      });
    } catch (error) {
      toast({
        title: 'Erro ao carregar opções',
        description: error instanceof Error ? error.message : String(error)
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchContas();
  }, [fetchContas]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);


  return {
    contas,
    loading,
    options,
    refetchContas: fetchContas,
    page,
    totalPages,
    totalCount,
    setPage
  };


}