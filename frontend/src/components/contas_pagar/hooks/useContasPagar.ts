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
          const fromDate = filters.dataVencimento.from instanceof Date
            ? filters.dataVencimento.from
            : new Date(filters.dataVencimento.from as any);

          // Formatar usando o timezone local - criar nova data para evitar mutação
          const localFrom = new Date(fromDate.getTime() - fromDate.getTimezoneOffset() * 60000);
          const year = localFrom.getUTCFullYear();
          const month = String(localFrom.getUTCMonth() + 1).padStart(2, '0');
          const day = String(localFrom.getUTCDate()).padStart(2, '0');
          params.data_vencimento_inicio = `${year}-${month}-${day}`;

          if (filters.dataVencimento.to) {
            const toDate = filters.dataVencimento.to instanceof Date
              ? filters.dataVencimento.to
              : new Date(filters.dataVencimento.to as any);

            // Formatar usando o timezone local - criar nova data para evitar mutação
            const localTo = new Date(toDate.getTime() - toDate.getTimezoneOffset() * 60000);
            const toYear = localTo.getUTCFullYear();
            const toMonth = String(localTo.getUTCMonth() + 1).padStart(2, '0');
            const toDay = String(localTo.getUTCDate()).padStart(2, '0');
            params.data_vencimento_fim = `${toYear}-${toMonth}-${toDay}`;
          }
        }

        if (filters.dataPagamento?.from) {
          const fromDate = filters.dataPagamento.from instanceof Date
            ? filters.dataPagamento.from
            : new Date(filters.dataPagamento.from as any);

          // Formatar usando o timezone local - criar nova data para evitar mutação
          const localFrom = new Date(fromDate.getTime() - fromDate.getTimezoneOffset() * 60000);
          params.data_pagamento_inicio = `${localFrom.getUTCFullYear()}-${String(localFrom.getUTCMonth() + 1).padStart(2, '0')}-${String(localFrom.getUTCDate()).padStart(2, '0')}`;

          if (filters.dataPagamento.to) {
            const toDate = filters.dataPagamento.to instanceof Date
              ? filters.dataPagamento.to
              : new Date(filters.dataPagamento.to as any);

            // Formatar usando o timezone local - criar nova data para evitar mutação
            const localTo = new Date(toDate.getTime() - toDate.getTimezoneOffset() * 60000);
            params.data_pagamento_fim = `${localTo.getUTCFullYear()}-${String(localTo.getUTCMonth() + 1).padStart(2, '0')}-${String(localTo.getUTCDate()).padStart(2, '0')}`;
          }
        }
      }

      // Adicionar busca se existir
      if (searchTerm) {
        params.search = searchTerm;
      }

      console.log('📤 Parâmetros enviados ao backend:', params);

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