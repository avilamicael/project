import { useState, useEffect, useMemo } from 'react';
import type { Filters, ContaPagar } from '@/types/contasPagar';
import { isVencida } from '@/lib/utils';

export function useFiltros(contas: ContaPagar[]) {
    const [filters, setFilters] = useState<Filters>({
        status: [],
        filial: [],
        categoria: [],
        fornecedor: [],
        dataVencimento: undefined,
        dataPagamento: undefined,
        dataMovimentacao: undefined
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Restaurar filtros da URL na inicialização
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const restored = { ...filters };

        ['status', 'filial', 'categoria', 'fornecedor'].forEach(key => {
            const val = params.get(key);
            if (val) (restored as any)[key] = val.split(',');
        });

        setFilters(restored);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persistir filtros na URL
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            
            ['status', 'filial', 'categoria', 'fornecedor'].forEach(key => {
                const value = (filters as any)[key];
                if (value?.length) params.set(key, value.join(','));
            });

            const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
            window.history.replaceState({}, '', newUrl);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    // Aplicar filtros e ordenação
    const contasFiltradas = useMemo(() => {
        let result = [...contas];

        // Filtro de busca
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(conta =>
                conta.descricao?.toLowerCase().includes(term) ||
                conta.numero_documento?.toLowerCase().includes(term) ||
                conta.fornecedor_nome?.toLowerCase().includes(term)
            );
        }

        // Filtros de status
        if (filters.status.length > 0) {
            result = result.filter(conta => filters.status.includes(conta.status));
        }

        // Filtros de filial
        if (filters.filial.length > 0) {
            result = result.filter(conta => filters.filial.includes(conta.filial_id));
        }

        // Filtros de categoria
        if (filters.categoria.length > 0) {
            result = result.filter(conta => filters.categoria.includes(conta.categoria_id));
        }

        // Filtros de fornecedor
        if (filters.fornecedor.length > 0) {
            result = result.filter(conta => filters.fornecedor.includes(conta.fornecedor_id));
        }

        // Filtro de data de vencimento
        if (filters.dataVencimento?.from) {
            const fromDate = new Date(filters.dataVencimento.from as any);
            const toDate = filters.dataVencimento.to ? new Date(filters.dataVencimento.to as any) : fromDate;
            result = result.filter(conta => {
                const dataVenc = new Date(conta.data_vencimento);
                return dataVenc.getTime() >= fromDate.getTime() && dataVenc.getTime() <= toDate.getTime();
            });
        }

        // Filtro de data de pagamento
        if (filters.dataPagamento?.from) {
            const fromDate = new Date(filters.dataPagamento.from as any);
            const toDate = filters.dataPagamento.to ? new Date(filters.dataPagamento.to as any) : fromDate;
            result = result.filter(conta => {
                if (!conta.data_pagamento) return false;
                const dataPag = new Date(conta.data_pagamento);
                return dataPag.getTime() >= fromDate.getTime() && dataPag.getTime() <= toDate.getTime();
            });
        }

        // Filtro de data de movimentação
        if (filters.dataMovimentacao?.from) {
            const fromDate = new Date(filters.dataMovimentacao.from as any);
            const toDate = filters.dataMovimentacao.to ? new Date(filters.dataMovimentacao.to as any) : fromDate;
            result = result.filter(conta => {
                if (!conta.data_movimentacao) return false;
                const dataMovimentacao = new Date(conta.data_movimentacao);
                return dataMovimentacao.getTime() >= fromDate.getTime() && dataMovimentacao.getTime() <= toDate.getTime();
            });
        }

        // Ordenação: vencidas primeiro, depois por data de vencimento
        result.sort((a, b) => {
            const aVencida = isVencida(a.data_vencimento, a.status);
            const bVencida = isVencida(b.data_vencimento, b.status);

            if (aVencida && !bVencida) return -1;
            if (!aVencida && bVencida) return 1;

            return new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime();
        });

        return result;
    }, [contas, searchTerm, filters]);

    const clearFilters = () => {
        setFilters({
            status: [],
            filial: [],
            categoria: [],
            fornecedor: [],
            dataVencimento: undefined,
            dataPagamento: undefined,
            dataMovimentacao: undefined
        });
        setSearchTerm('');
    };

    return {
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
        contasFiltradas,
        clearFilters
    };
}
