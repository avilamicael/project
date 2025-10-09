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

        console.log('=== FILTROS DEBUG ===');
        console.log('Total contas:', contas.length);
        console.log('Filtros ativos:', filters);

        if (contas.length > 0) {
            console.log('Exemplo conta[0]:', {
                id: contas[0].id,
                filial_id: contas[0].filial_id,
                fornecedor_id: contas[0].fornecedor_id,
                categoria_id: contas[0].categoria_id
            });
        }

        // Filtro de busca
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(conta =>
                conta.descricao?.toLowerCase().includes(term) ||
                conta.fornecedor_nome?.toLowerCase().includes(term)
            );
            console.log('Após busca:', result.length);
        }

        // Filtros de status
        if (filters.status.length > 0) {
            console.log('Filtrando status:', filters.status);
            const before = result.length;

            // Mostrar todos os status únicos nas contas
            const statusNasContas = [...new Set(result.map(c => c.status))];
            console.log('Status disponíveis nas contas:', statusNasContas);
            console.log('Status buscado está nas contas?', filters.status.some(f => statusNasContas.includes(f as any)));

            result = result.filter(conta => {
                const match = filters.status.includes(conta.status);
                if (before <= 5) console.log(`Conta ${conta.id}: status="${conta.status}", buscando=${filters.status}, match=${match}`);
                return match;
            });
            console.log(`Status: ${before} -> ${result.length}`);
        }

        // Filtros de filial
        if (filters.filial.length > 0) {
            console.log('Filtrando filial:', filters.filial);
            const before = result.length;
            result = result.filter(conta => {
                const match = filters.filial.some(f => String(f) === String(conta.filial_id));
                if (before <= 3) console.log(`Conta ${conta.id}: filial_id=${conta.filial_id}, match=${match}`);
                return match;
            });
            console.log(`Filial: ${before} -> ${result.length}`);
        }

        // Filtros de categoria
        if (filters.categoria.length > 0) {
            console.log('Filtrando categoria:', filters.categoria);
            const before = result.length;
            result = result.filter(conta => {
                const match = filters.categoria.some(c => String(c) === String(conta.categoria_id));
                if (before <= 3) console.log(`Conta ${conta.id}: categoria_id=${conta.categoria_id}, match=${match}`);
                return match;
            });
            console.log(`Categoria: ${before} -> ${result.length}`);
        }

        // Filtros de fornecedor
        if (filters.fornecedor.length > 0) {
            console.log('Filtrando fornecedor:', filters.fornecedor);
            const before = result.length;
            result = result.filter(conta => {
                const match = filters.fornecedor.some(f => String(f) === String(conta.fornecedor_id));
                if (before <= 3) console.log(`Conta ${conta.id}: fornecedor_id=${conta.fornecedor_id}, match=${match}`);
                return match;
            });
            console.log(`Fornecedor: ${before} -> ${result.length}`);
        }

        // Filtro de data de vencimento
        if (filters.dataVencimento?.from) {
            console.log('Filtrando dataVencimento:', filters.dataVencimento);
            const fromDate = new Date(filters.dataVencimento.from as any);
            const toDate = filters.dataVencimento.to ? new Date(filters.dataVencimento.to as any) : fromDate;
            const before = result.length;
            result = result.filter(conta => {
                const dataVenc = new Date(conta.data_vencimento);
                const match = dataVenc.getTime() >= fromDate.getTime() && dataVenc.getTime() <= toDate.getTime();
                if (before <= 3) console.log(`Conta ${conta.id}: data_vencimento=${conta.data_vencimento}, match=${match}`);
                return match;
            });
            console.log(`Data vencimento: ${before} -> ${result.length}`);
        }

        // Filtro de data de pagamento
        if (filters.dataPagamento?.from) {
            console.log('Filtrando dataPagamento:', filters.dataPagamento);
            const fromDate = new Date(filters.dataPagamento.from as any);
            const toDate = filters.dataPagamento.to ? new Date(filters.dataPagamento.to as any) : fromDate;
            const before = result.length;
            result = result.filter(conta => {
                if (!conta.data_pagamento) return false;
                const dataPag = new Date(conta.data_pagamento);
                return dataPag.getTime() >= fromDate.getTime() && dataPag.getTime() <= toDate.getTime();
            });
            console.log(`Data pagamento: ${before} -> ${result.length}`);
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
