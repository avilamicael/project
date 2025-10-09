import { useState, useEffect, useCallback } from 'react';
import { contasPagarService, filiaisService, categoriasService, fornecedoresService } from '@/services/contas-pagar.service';
import { useToast } from '@/hooks/use-toast';
import type { ContaPagar, Options, Filters } from '@/types/contasPagar';

export function useContasPagar(filters?: Filters, searchTerm?: string) {
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

      // Preparar parâmetros com filtros
      const params: any = { page };

      // Adicionar filtros se existirem
      if (filters) {
        if (filters.status?.length) params.status = filters.status.map(String);
        if (filters.filial?.length) params.filial = filters.filial.map(String);
        if (filters.categoria?.length) params.categoria = filters.categoria.map(String);
        if (filters.fornecedor?.length) params.fornecedor = filters.fornecedor.map(String);

        if (filters.dataVencimento?.from) {
          params.data_vencimento_inicio = new Date(filters.dataVencimento.from as any).toISOString().split('T')[0];
          if (filters.dataVencimento.to) {
            params.data_vencimento_fim = new Date(filters.dataVencimento.to as any).toISOString().split('T')[0];
          }
        }

        if (filters.dataPagamento?.from) {
          params.data_pagamento_inicio = new Date(filters.dataPagamento.from as any).toISOString().split('T')[0];
          if (filters.dataPagamento.to) {
            params.data_pagamento_fim = new Date(filters.dataPagamento.to as any).toISOString().split('T')[0];
          }
        }
      }

      // Adicionar busca se existir
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await contasPagarService.listar(params);
      const contasData = response.results || response;

      setContas(contasData);

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
  }, [page, filters, searchTerm, toast]);



  const fetchOptions = useCallback(async () => {
    try {
      const [filiais, categorias, fornecedores] = await Promise.all([
        filiaisService.listar(),
        categoriasService.listar(),
        fornecedoresService.listar()
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