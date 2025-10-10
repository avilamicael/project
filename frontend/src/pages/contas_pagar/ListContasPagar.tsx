import React, { useState, useMemo } from 'react';
import { ContaPagar } from '@/types/contasPagar';
import { contasPagarService } from '@/services/contas-pagar.service';
import { DialogPagamento } from '@/components/contas_pagar/DialogPagamento';
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useContasPagar } from '@/components/contas_pagar/hooks/useContasPagar';
import { useFiltros } from '@/components/contas_pagar/hooks/useFiltros';
import { useContasPagarStats } from '@/components/contas_pagar/hooks/useContasPagarStats';
import { FiltrosCard } from '@/components/contas_pagar/FiltrosCard';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';
import { BatchActionsCard } from '@/components/contas_pagar/BatchActionsCard';
import { ContasPagarTable } from '@/components/contas_pagar/ContasPagarTable';
import { ContasPagarDetails } from '@/components/contas_pagar/ContasPagarDetails';
import {
    calcularValorFinal,
    calcularValorRestante,
    formatCurrency
} from '@/lib/utils';

import { PagamentoData } from '@/components/contas_pagar/DialogPagamento';

export default function ContasPagarPage() {
    const { toast } = useToast();
    const { filters, setFilters, searchTerm, setSearchTerm, clearFilters } = useFiltros([]);
    const { contas, loading, options, refetchContas, page, totalPages, totalCount, setPage } = useContasPagar(filters, searchTerm);
    const contasFiltradas = contas; // Agora os filtros são aplicados no backend
    const [statsRefreshTrigger, setStatsRefreshTrigger] = React.useState(0);
    const estatisticas = useContasPagarStats(statsRefreshTrigger);

    // Resetar página para 1 quando os filtros mudarem
    React.useEffect(() => {
        setPage(1);
    }, [filters, searchTerm, setPage]);

    const [selectedContas, setSelectedContas] = useState<string[]>([]);
    const [selectAllMode, setSelectAllMode] = useState(false); // true = todas as contas, false = apenas página atual
    const [selectAllLoading, setSelectAllLoading] = useState(false);
    const [allContasData, setAllContasData] = useState<ContaPagar[]>([]); // Cache de todas as contas quando "selecionar todas"
    const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [payDialogIds, setPayDialogIds] = useState<string[]>([]);
    const [payLoading, setPayLoading] = useState(false);

    // Calcular total selecionado
    const totalSelecionado = useMemo(() => {
        // Se está em modo "selecionar todas", usar o cache de todas as contas
        const sourceContas = selectAllMode && allContasData.length > 0 ? allContasData : contas;

        return selectedContas.reduce((total: number, id) => {
            const conta = sourceContas.find(c => c.id === id);
            if (conta) {
                const valorFinal = calcularValorFinal(conta);
                return total + Number(valorFinal);
            }
            return total;
        }, 0);
    }, [selectedContas, contas, selectAllMode, allContasData]);

    // Buscar todas as contas (todas as páginas)
    const fetchAllContas = async () => {
        try {
            const response = await contasPagarService.listar({ page: 1, page_size: 99999 });
            const todasContas = response.results || response;

            // Padronizar as contas assim como no hook useContasPagar
            const contasPadronizadas = todasContas.map((conta: any) => ({
                ...conta,
                fornecedor_id: conta.fornecedor_id ?? conta.fornecedor,
                filial_id: conta.filial_id ?? conta.filial,
                categoria_id: conta.categoria_id ?? conta.categoria,
            }));

            return contasPadronizadas;
        } catch (error) {
            toast({
                title: "Erro ao buscar todas as contas",
                description: String(error)
            });
            return [];
        }
    };

    // Handlers
    const handleSelectAll = async () => {
        // Se já tem contas selecionadas, desmarcar todas
        if (selectedContas.length > 0) {
            setSelectedContas([]);
            setSelectAllMode(false);
            setAllContasData([]);
            return;
        }

        // Selecionar TODAS as contas (todas as páginas)
        setSelectAllLoading(true);
        try {
            const todasContas = await fetchAllContas();
            const ids = todasContas.map((c: any) => c.id as string);

            setAllContasData(todasContas as ContaPagar[]);
            setSelectedContas(ids);
            setSelectAllMode(true);

            toast({
                title: "Todas as contas selecionadas",
                description: `${ids.length} contas foram selecionadas de todas as páginas`
            });
        } finally {
            setSelectAllLoading(false);
        }
    };

    const handleSelectConta = (id: string) => {
        setSelectedContas(prev => {
            const newSelected = prev.includes(id)
                ? prev.filter(cid => cid !== id)
                : [...prev, id];

            // Se estava em modo "selecionar todas" e desmarcar uma, sair do modo
            if (selectAllMode && !newSelected.includes(id)) {
                setSelectAllMode(false);
            }

            return newSelected;
        });
    };

    const handleViewDetails = (conta: ContaPagar) => {
        setSelectedConta(conta);
        setDrawerOpen(true);
    };

    const openPayDialog = (ids: string[]) => {
        setPayDialogIds(ids);
        setPayDialogOpen(true);
    };

    const handleConfirmarPagamento = async (pagamentos: PagamentoData[]) => {
        setPayLoading(true);
        try {
            for (const pagamento of pagamentos) {
                const conta = contas.find(c => c.id === pagamento.id);
                if (!conta) continue;

                const valorTotal = pagamento.valor + pagamento.multa + pagamento.juros;
                await contasPagarService.pagar(String(pagamento.id), {
                    valor_pago: valorTotal,
                    data_pagamento: pagamento.data
                });

                toast({
                    title: `Conta "${conta.descricao}" marcada como paga`,
                    description: `Valor: ${formatCurrency(valorTotal)} | Multa: ${formatCurrency(pagamento.multa)} | Juros: ${formatCurrency(pagamento.juros)}`
                });
            }
            await refetchContas();
            setStatsRefreshTrigger(prev => prev + 1); // Atualiza as estatísticas
            setPayDialogOpen(false);
            setSelectedContas([]);
            setSelectAllMode(false);
            setAllContasData([]);
        } catch (error) {
            const e = error as any;
            toast({
                title: "Erro ao realizar pagamento",
                description: e?.message || String(error)
            });
        } finally {
            setPayLoading(false);
        }
    };

    const handleExportar = async (onlySelected = true) => {
        let rows: any[] = [];

        if (onlySelected) {
            // Se está em modo "selecionar todas", usar o cache de todas as contas
            if (selectAllMode && allContasData.length > 0) {
                rows = allContasData.filter((c: any) => selectedContas.includes(c.id));
            } else {
                // Apenas contas da página atual
                rows = contas.filter(c => selectedContas.includes(c.id));
            }
        } else {
            rows = contasFiltradas;
        }

        if (rows.length === 0) {
            toast({ title: 'Nada para exportar', description: 'Nenhuma conta selecionada.' });
            return;
        }

        const headers = ['id', 'descricao', 'fornecedor', 'filial', 'categoria', 'data_vencimento', 'valor_final', 'valor_pago', 'valor_restante', 'status'];
        const csv = [headers.join(',')].concat(rows.map((r: any) => {
            const valorFinal = calcularValorFinal(r);
            const valorRest = calcularValorRestante(r);
            return [r.id, `"${(r.descricao || '').replace(/"/g, '""')}"`, `"${r.fornecedor_nome || ''}"`, `"${r.filial_nome || ''}"`, `"${r.categoria_nome || ''}"`, r.data_vencimento, valorFinal, r.valor_pago || 0, valorRest, r.status].join(',');
        })).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contas_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast({ title: 'Exportado', description: `${rows.length} contas exportadas com sucesso.` });
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Contas a Pagar</h2>
                    <p className="text-muted-foreground">
                        Gerencie e acompanhe suas contas a pagar
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button size="sm" onClick={() => window.location.href = '/contas-pagar'}>
                        Adicionar Conta
                    </Button>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Pendente"
                    value={formatCurrency(estatisticas.totalPendente)}
                    subtitle="Contas não pagas"
                    icon={DollarSign}
                    colorClass="text-blue-600"
                />
                <StatCard
                    title="Vencidas"
                    value={estatisticas.vencidas.count}
                    subtitle={formatCurrency(estatisticas.vencidas.valor)}
                    icon={AlertCircle}
                    colorClass="text-red-600"
                />
                <StatCard
                    title="Pagas Hoje"
                    value={estatisticas.pagasHoje}
                    subtitle="Pagamentos realizados"
                    icon={CheckCircle2}
                    colorClass="text-green-600"
                />
                <StatCard
                    title="Próximos 7 Dias"
                    value={estatisticas.proximosVencimentos}
                    subtitle="Vencimentos próximos"
                    icon={Clock}
                    colorClass="text-orange-600"
                />
            </div>

            {/* Filtros */}
            <FiltrosCard
                filters={filters}
                setFilters={setFilters}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                options={options}
                onClearFilters={clearFilters}
            />

            {/* Barra de Seleção */}
            <BatchActionsCard
                selectedContas={selectedContas}
                contas={contas}
                contasFiltradas={contasFiltradas}
                totalSelecionado={totalSelecionado}
                selectAllLoading={selectAllLoading}
                onClearSelection={() => {
                    setSelectedContas([]);
                    setSelectAllMode(false);
                    setAllContasData([]);
                }}
                onSelectVisible={() => {
                    setSelectedContas(contasFiltradas.map(c => c.id));
                    setSelectAllMode(false);
                    setAllContasData([]);
                }}
                onSelectAll={handleSelectAll}
                onExport={handleExportar}
                onPay={openPayDialog}
            />

            {/* Tabela */}
            <Card>
                <CardContent className="p-0">
                    <ContasPagarTable
                        contas={contasFiltradas}
                        selectedContas={selectedContas}
                        loading={loading}
                        selectAllMode={selectAllMode}
                        totalContas={totalCount}
                        onSelectAll={handleSelectAll}
                        onSelectConta={handleSelectConta}
                        onViewDetails={handleViewDetails}
                    />
                    {/* Paginação */}
                    <div className="flex items-center justify-between p-4 border-t bg-muted/20">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Anterior
                        </Button>

                        <span className="text-sm text-muted-foreground">
                            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages || loading}
                        >
                            Próxima
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Drawer de Detalhes */}
            <ContasPagarDetails
                conta={selectedConta}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                onPagamentoConfirmado={refetchContas}
            />

            {/* Dialog de Pagamento */}
            <DialogPagamento
                open={payDialogOpen}
                onOpenChange={setPayDialogOpen}
                contas={contas}
                ids={payDialogIds}
                loading={payLoading}
                onConfirmar={handleConfirmarPagamento}
            />
        </div>
    );
}