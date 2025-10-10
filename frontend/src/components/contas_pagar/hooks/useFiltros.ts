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
        dataPagamento: undefined
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
                conta.fornecedor_nome?.toLowerCase().includes(term)
            );
        }

        // Filtros de status
        if (filters.status.length > 0) {
            const before = result.length;

            // Mostrar todos os status únicos nas contas
            const statusNasContas = [...new Set(result.map(c => c.status))];

            result = result.filter(conta => {
                const match = filters.status.includes(conta.status);
                if (before <= 5) console.log(`Conta ${conta.id}: status="${conta.status}", buscando=${filters.status}, match=${match}`);
                return match;
            });
        }

        // Filtros de filial
        if (filters.filial.length > 0) {
            const before = result.length;
            result = result.filter(conta => {
                const match = filters.filial.some(f => String(f) === String(conta.filial_id));
                if (before <= 3) console.log(`Conta ${conta.id}: filial_id=${conta.filial_id}, match=${match}`);
                return match;
            });
        }

        // Filtros de categoria
        if (filters.categoria.length > 0) {
            const before = result.length;
            result = result.filter(conta => {
                const match = filters.categoria.some(c => String(c) === String(conta.categoria_id));
                if (before <= 3) console.log(`Conta ${conta.id}: categoria_id=${conta.categoria_id}, match=${match}`);
                return match;
            });
        }

        // Filtros de fornecedor
        if (filters.fornecedor.length > 0) {
            const before = result.length;
            result = result.filter(conta => {
                const match = filters.fornecedor.some(f => String(f) === String(conta.fornecedor_id));
                if (before <= 3) console.log(`Conta ${conta.id}: fornecedor_id=${conta.fornecedor_id}, match=${match}`);
                return match;
            });
        }

        // Filtro de data de vencimento
        if (filters.dataVencimento?.from) {
            const fromDate = new Date(filters.dataVencimento.from as any);
            const toDate = filters.dataVencimento.to ? new Date(filters.dataVencimento.to as any) : fromDate;
            const before = result.length;
            result = result.filter(conta => {
                const dataVenc = new Date(conta.data_vencimento);
                const match = dataVenc.getTime() >= fromDate.getTime() && dataVenc.getTime() <= toDate.getTime();
                if (before <= 3) console.log(`Conta ${conta.id}: data_vencimento=${conta.data_vencimento}, match=${match}`);
                return match;
            });
        }

        // Filtro de data de pagamento
        if (filters.dataPagamento?.from) {
            const fromDate = new Date(filters.dataPagamento.from as any);
            const toDate = filters.dataPagamento.to ? new Date(filters.dataPagamento.to as any) : fromDate;
            const before = result.length;
            result = result.filter(conta => {
                if (!conta.data_pagamento) return false;
                const dataPag = new Date(conta.data_pagamento);
                return dataPag.getTime() >= fromDate.getTime() && dataPag.getTime() <= toDate.getTime();
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
            dataPagamento: undefined
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
