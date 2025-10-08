import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { contasPagarService } from '@/services/contas-pagar.service';
import {
    Search,
    Filter,
    Download,
    CheckCircle2,
    X,
    Clock,
    AlertCircle,
    DollarSign,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { MultiSelect } from '@/components/shared/MultiSelect';
import {
    STATUS_CONFIG,
    formatCurrency,
    formatDate,
    isVencida,
    calcularValorFinal,
    calcularValorRestante
} from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ContaPagar, Filters, Options } from '@/types/contasPagar';

export default function ContasPagarPage() {
    const { toast } = useToast();

    // Estados
    const [contas, setContas] = useState<ContaPagar[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContas, setSelectedContas] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const searchRef = useRef<any>(null);
    const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const tableRef = useRef<HTMLDivElement | null>(null);

    // Filtros
    const [filters, setFilters] = useState<Filters>({
        status: [],
        filial: [],
        categoria: [],
        fornecedor: [],
        dataVencimento: undefined,
        dataPagamento: undefined,
        dataMovimentacao: undefined
    } as Filters);

    // Opções para os selects (virão da API)
    const [options, setOptions] = useState<Options>({
        filiais: [],
        categorias: [],
        fornecedores: []
    } as Options);

    // Carregar dados iniciais e restaurar filtros da URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const restored = { ...filters } as Filters;
        const statusVal = params.get('status');
        if (statusVal) restored.status = statusVal.split(',');
        const filialVal = params.get('filial');
        if (filialVal) restored.filial = filialVal.split(',');
        const categoriaVal = params.get('categoria');
        if (categoriaVal) restored.categoria = categoriaVal.split(',');
        const fornecedorVal = params.get('fornecedor');
        if (fornecedorVal) restored.fornecedor = fornecedorVal.split(',');
        setFilters(restored);

        fetchContas();
        fetchOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchContas = async () => {
        try {
            setLoading(true);
            const data = await contasPagarService.listar();
            // Garantir compatibilidade dos campos esperados
            const contasPadronizadas = data.map((conta: any) => ({
                ...conta,
                fornecedor_id: conta.fornecedor_id ?? conta.fornecedor,
                filial_id: conta.filial_id ?? conta.filial,
                categoria_id: conta.categoria_id ?? conta.categoria,
            }));
            setContas(contasPadronizadas);
        } catch (error) {
            const e = error as any;
            toast({
                title: "Erro ao carregar contas",
                description: e?.message || String(error)
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            // Carregar opções para os filtros
            const filiaisResp = await fetch('/api/filiais/');
            const categoriasResp = await fetch('/api/categorias-financeiras/?tipo=despesa');
            const fornecedoresResp = await fetch('/api/fornecedores/');

            const filiais = await filiaisResp.json() as any[];
            const categorias = await categoriasResp.json() as any[];
            const fornecedores = await fornecedoresResp.json() as any[];

            setOptions({
                filiais: filiais.map((f: any) => ({ value: f.id, label: f.nome })),
                categorias: categorias.map((c: any) => ({ value: c.id, label: c.nome })),
                fornecedores: fornecedores.map((f: any) => ({ value: f.id, label: f.nome }))
            });
        } catch (error) {
            console.error('Erro ao carregar opções:', error);
        }
    };

    // Filtrar e ordenar contas
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
        if (filters.dataVencimento && filters.dataVencimento.from) {
            const fromDate = new Date(filters.dataVencimento.from as any);
            const toDate = filters.dataVencimento.to ? new Date(filters.dataVencimento.to as any) : fromDate;
            result = result.filter(conta => {
                const dataVenc = new Date(conta.data_vencimento);
                return dataVenc.getTime() >= fromDate.getTime() && dataVenc.getTime() <= toDate.getTime();
            });
        }

        // Filtro de data de pagamento
        if (filters.dataPagamento && filters.dataPagamento.from) {
            const fromDate = new Date(filters.dataPagamento.from as any);
            const toDate = filters.dataPagamento.to ? new Date(filters.dataPagamento.to as any) : fromDate;
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

    // Persistir filtros na URL (debounced)
    useEffect(() => {
        const t = setTimeout(() => {
            const params = new URLSearchParams();
            if (filters.status.length) params.set('status', filters.status.join(','));
            if (filters.filial.length) params.set('filial', filters.filial.join(','));
            if (filters.categoria.length) params.set('categoria', filters.categoria.join(','));
            if (filters.fornecedor.length) params.set('fornecedor', filters.fornecedor.join(','));
            const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
            window.history.replaceState({}, '', newUrl);
        }, 500);
        return () => clearTimeout(t);
    }, [filters]);

    // Debounce para busca (só para UX, filtro já usa searchTerm)
    useEffect(() => {
        if (searchRef.current) clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            // noop - manter compatibilidade (o filtro usa searchTerm diretamente)
        }, 300);
        return () => clearTimeout(searchRef.current);
    }, [searchTerm]);

    // Hotkeys: Space para selecionar linha focada, Enter para abrir detalhes
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const active = document.activeElement as HTMLElement | null;
        if (!active) return;

        if (tableRef.current && tableRef.current.contains(active)) {
            if (e.code === 'Space') {
                e.preventDefault();
                const row = active.closest('[data-conta-id]') as HTMLElement | null;
                if (row) {
                    const id = Number(row.dataset.contaId);
                    handleSelectConta(id);
                }
            }
            if (e.code === 'Enter') {
                const row = active.closest('[data-conta-id]') as HTMLElement | null;
                if (row) {
                    const id = Number(row.dataset.contaId);
                    const conta = contas.find(c => c.id === id);
                    if (conta) handleViewDetails(conta);
                }
            }
        }
    }, [contas]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Calcular estatísticas
    const estatisticas = useMemo(() => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const proximos7Dias = new Date();
        proximos7Dias.setDate(proximos7Dias.getDate() + 7);
        proximos7Dias.setHours(23, 59, 59, 999);

        const stats = {
            totalPendente: 0,
            vencidas: { count: 0, valor: 0 },
            pagasHoje: 0,
            proximosVencimentos: 0
        };

        contas.forEach(conta => {
            const valorFinal = calcularValorFinal(conta);
            const valorRestante = calcularValorRestante(conta);
            const dataVenc = new Date(conta.data_vencimento);
            const dataPag = conta.data_pagamento ? new Date(conta.data_pagamento) : null;

            // Total pendente (não pagas e não canceladas)
            if (conta.status !== 'paga' && conta.status !== 'cancelada') {
                stats.totalPendente += valorRestante;
            }

            // Vencidas
            if (isVencida(conta.data_vencimento, conta.status)) {
                stats.vencidas.count++;
                stats.vencidas.valor += valorRestante;
            }

            // Pagas hoje
            if (dataPag && dataPag.toDateString() === hoje.toDateString()) {
                stats.pagasHoje++;
            }

            // Próximos vencimentos (7 dias)
            if (conta.status !== 'paga' && conta.status !== 'cancelada' &&
                dataVenc >= hoje && dataVenc <= proximos7Dias) {
                stats.proximosVencimentos++;
            }
        });

        return stats;
    }, [contas]);

    // Calcular total selecionado
    const totalSelecionado = useMemo(() => {
        return selectedContas.reduce((total, id) => {
            const conta = contas.find(c => c.id === id);
            if (conta) {
                return total + calcularValorFinal(conta);
            }
            return total;
        }, 0);
    }, [selectedContas, contas]);

    // Handlers
    const handleSelectAll = () => {
        // Seleciona apenas as contas atualmente filtradas (visíveis)
        if (selectedContas.length === contasFiltradas.length) {
            setSelectedContas([]);
        } else {
            setSelectedContas(contasFiltradas.map(c => c.id));
        }
    };

    const handleSelectConta = (id: number) => {
        setSelectedContas(prev =>
            prev.includes(id)
                ? prev.filter(cid => cid !== id)
                : [...prev, id]
        );
    };

    const handleClearFilters = () => {
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

    const handleMarcarComoPaga = async (ids: number[]) => {
        try {
            await fetch('/api/contas-pagar/marcar-paga/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });

            toast({
                title: "Sucesso",
                description: `${ids.length} conta(s) marcada(s) como paga.`
            });

            fetchContas();
            setSelectedContas([]);
        } catch (error) {
            const e = error as any;
                toast({
                    title: "Erro",
                    description: e?.message || String(error)
                });
        }
    };

    const handleExportar = (onlySelected = true) => {
        const rows = onlySelected ? contas.filter(c => selectedContas.includes(c.id)) : contasFiltradas;
        if (rows.length === 0) {
            toast({ title: 'Nada para exportar', description: 'Nenhuma conta selecionada.' });
            return;
        }

        const headers = ['id','descricao','fornecedor','filial','categoria','data_vencimento','valor_final','valor_pago','valor_restante','status'];
        const csv = [headers.join(',')].concat(rows.map(r => {
            const valorFinal = calcularValorFinal(r);
            const valorRest = calcularValorRestante(r);
            return [r.id, `"${(r.descricao||'').replace(/"/g,'""')}"`, `"${r.fornecedor_nome||''}"`, `"${r.filial_nome||''}"`, `"${r.categoria_nome||''}"`, r.data_vencimento, valorFinal, r.valor_pago || 0, valorRest, r.status].join(',');
        })).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contas_export_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast({ title: 'Exportado', description: 'Arquivo CSV gerado.' });
    };

    const handleViewDetails = (conta: ContaPagar) => {
        setSelectedConta(conta);
        setDrawerOpen(true);
    };

    const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
        value,
        // config is any-like in runtime; use as any for typing
        label: (config as any).label
    }));

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
                    <Button size="sm">
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
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <MultiSelect
                                options={statusOptions}
                                selected={filters.status}
                                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                placeholder="Todos os status"
                                searchPlaceholder="Buscar status..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Filial</Label>
                            <MultiSelect
                                options={options.filiais}
                                selected={filters.filial}
                                onChange={(value) => setFilters(prev => ({ ...prev, filial: value }))}
                                placeholder="Todas as filiais"
                                searchPlaceholder="Buscar filial..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <MultiSelect
                                options={options.categorias}
                                selected={filters.categoria}
                                onChange={(value) => setFilters(prev => ({ ...prev, categoria: value }))}
                                placeholder="Todas as categorias"
                                searchPlaceholder="Buscar categoria..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Fornecedor</Label>
                            <MultiSelect
                                options={options.fornecedores}
                                selected={filters.fornecedor}
                                onChange={(value) => setFilters(prev => ({ ...prev, fornecedor: value }))}
                                placeholder="Todos os fornecedores"
                                searchPlaceholder="Buscar fornecedor..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Data de Vencimento</Label>
                            <DateRangePicker
                                date={filters.dataVencimento}
                                setDate={(value) => setFilters(prev => ({ ...prev, dataVencimento: value }))}
                                placeholder="Período de vencimento"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Data de Pagamento</Label>
                            <DateRangePicker
                                date={filters.dataPagamento}
                                setDate={(value) => setFilters(prev => ({ ...prev, dataPagamento: value }))}
                                placeholder="Período de pagamento"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Data de Movimentação</Label>
                            <DateRangePicker
                                date={filters.dataMovimentacao}
                                setDate={(value) => setFilters(prev => ({ ...prev, dataMovimentacao: value }))}
                                placeholder="Período de movimentação"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Buscar</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Descrição, NF, fornecedor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" onClick={handleClearFilters}>
                            <X className="mr-2 h-4 w-4" />
                            Limpar Filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Barra de Seleção */}
            {selectedContas.length > 0 && (
                <Card className="border-primary">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-sm">
                                    <span className="font-semibold">{selectedContas.length}</span> itens selecionados
                                </div>
                                <div className="text-sm">
                                    Total: <span className="font-bold text-primary">{formatCurrency(totalSelecionado)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedContas([])}
                                >
                                    Limpar Seleção
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedContas(contasFiltradas.map(c => c.id))}
                                >
                                    Selecionar Visíveis
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        // TODO: se quiser selecionar tudo do servidor, chamar endpoint que retorna IDs ou implementar paginação
                                        setSelectedContas(contasFiltradas.map(c => c.id));
                                    }}
                                >
                                    Selecionar Tudo
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportar(false)}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar Tudo Visíveis
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        // eslint-disable-next-line no-restricted-globals
                                        if (window.confirm(`Confirma marcar ${selectedContas.length} conta(s) como paga?`)) {
                                            handleMarcarComoPaga(selectedContas);
                                        }
                                    }}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Marcar como Paga
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabela */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedContas.length === contasFiltradas.length && contasFiltradas.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Fornecedor</TableHead>
                                    <TableHead>Filial</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Vencimento</TableHead>
                                    <TableHead className="text-right">Valor Original</TableHead>
                                    <TableHead className="text-right">Valor Final</TableHead>
                                    <TableHead className="text-right">Valor Pago</TableHead>
                                    <TableHead className="text-right">Valor Restante</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-center py-8">
                                            Carregando...
                                        </TableCell>
                                    </TableRow>
                                ) : contasFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                                            Nenhuma conta encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    contasFiltradas.map((conta) => {


                                        const valorFinal = calcularValorFinal(conta);
                                        const valorRestante = calcularValorRestante(conta);
                                        const vencida = isVencida(conta.data_vencimento, conta.status);

                                        return (
                                            <TableRow
                                                key={conta.id}
                                                data-conta-id={conta.id}
                                                tabIndex={0}
                                                className={cn(
                                                    "cursor-pointer hover:bg-muted/50",
                                                    vencida && "bg-red-50/5",
                                                    selectedContas.includes(conta.id) && "bg-muted"
                                                )}
                                            >
                                                <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedContas.includes(conta.id)}
                                                        onCheckedChange={() => handleSelectConta(conta.id)}
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    className="font-medium"
                                                    onClick={() => handleViewDetails(conta)}
                                                >
                                                    <div className="flex flex-col">
                                                        <span>{conta.descricao}</span>
                                                        {conta.numero_documento && (
                                                            <span className="text-xs text-muted-foreground">
                                                                NF: {conta.numero_documento}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{conta.fornecedor_nome || '-'}</TableCell>
                                                <TableCell>{conta.filial_nome || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal">
                                                        {conta.categoria_nome || '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={cn(
                                                        "flex flex-col",
                                                        vencida && "text-red-600 font-semibold"
                                                    )}>
                                                        <span>{formatDate(conta.data_vencimento)}</span>
                                                        {vencida && (
                                                            <span className="text-xs">Vencida</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(conta.valor_original)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(valorFinal)}
                                                </TableCell>
                                                <TableCell className="text-right text-green-600">
                                                    {formatCurrency(conta.valor_pago || 0)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(valorRestante)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={STATUS_CONFIG[conta.status]?.color}
                                                    >
                                                        {STATUS_CONFIG[conta.status]?.label || conta.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewDetails(conta)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Ver Detalhes
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            {conta.status !== 'paga' && (
                                                                <DropdownMenuItem onClick={() => handleMarcarComoPaga([conta.id])}>
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Marcar como Paga
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem className="text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {/* Drawer de Detalhes */}
  <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
      {selectedConta && (
        <>
          <SheetHeader>
            <SheetTitle>Detalhes da Conta</SheetTitle>
            <SheetDescription>
              Informações completas e histórico da conta a pagar
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Básicas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{selectedConta.descricao}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={STATUS_CONFIG[selectedConta.status]?.color}
                    >
                      {STATUS_CONFIG[selectedConta.status]?.label}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Fornecedor</Label>
                  <p className="font-medium">{selectedConta.fornecedor_nome || '-'}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Filial</Label>
                  <p className="font-medium">{selectedConta.filial_nome || '-'}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Categoria</Label>
                  <p className="font-medium">{selectedConta.categoria_nome || '-'}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Número do Documento</Label>
                  <p className="font-medium">{selectedConta.numero_documento || '-'}</p>
                </div>
              </div>
            </div>

            {/* Valores */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Valores</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Valor Original</Label>
                  <p className="font-medium text-lg">
                    {formatCurrency(selectedConta.valor_original)}
                  </p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Desconto</Label>
                  <p className="font-medium text-green-600">
                    {formatCurrency(selectedConta.desconto || 0)}
                  </p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Juros</Label>
                  <p className="font-medium text-orange-600">
                    {formatCurrency(selectedConta.juros || 0)}
                  </p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Multa</Label>
                  <p className="font-medium text-red-600">
                    {formatCurrency(selectedConta.multa || 0)}
                  </p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Valor Final</Label>
                  <p className="font-bold text-xl text-primary">
                    {formatCurrency(calcularValorFinal(selectedConta))}
                  </p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Valor Pago</Label>
                  <p className="font-medium text-green-600 text-lg">
                    {formatCurrency(selectedConta.valor_pago || 0)}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Valor Restante</Label>
                  <p className="font-bold text-2xl text-red-600">
                    {formatCurrency(calcularValorRestante(selectedConta))}
                  </p>
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Datas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data de Emissão</Label>
                  <p className="font-medium">{formatDate(selectedConta.data_emissao)}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Data de Vencimento</Label>
                  <p className={cn(
                    "font-medium",
                    isVencida(selectedConta.data_vencimento, selectedConta.status) && "text-red-600"
                  )}>
                    {formatDate(selectedConta.data_vencimento)}
                  </p>
                </div>
                
                {selectedConta.data_pagamento && (
                  <div>
                    <Label className="text-muted-foreground">Data de Pagamento</Label>
                    <p className="font-medium">{formatDate(selectedConta.data_pagamento)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            {selectedConta.observacoes && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Observações</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedConta.observacoes}
                </p>
              </div>
            )}

            {/* Forma de Pagamento */}
            {selectedConta.forma_pagamento_nome && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Forma de Pagamento</h3>
                <Badge variant="outline">{selectedConta.forma_pagamento_nome}</Badge>
              </div>
            )}

            {/* Registrar Pagamento */}
            {selectedConta.status !== 'paga' && selectedConta.status !== 'cancelada' && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Registrar Pagamento</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="valor-pagamento">Valor do Pagamento</Label>
                    <Input
                      id="valor-pagamento"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      defaultValue={calcularValorRestante(selectedConta)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data-pagamento">Data do Pagamento</Label>
                    <Input
                      id="data-pagamento"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="observacoes-pagamento">Observações</Label>
                    <Textarea
                      id="observacoes-pagamento"
                      placeholder="Adicione observações sobre o pagamento..."
                    />
                  </div>
                  
                  <Button className="w-full">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar Pagamento
                  </Button>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </>
      )}
    </SheetContent>
  </Sheet>
</div>
    );
}
