import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X, Search } from 'lucide-react';
import { MultiSelect } from '@/components/shared/MultiSelect';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { STATUS_CONFIG } from '@/lib/utils';
import type { Filters, Options } from '@/types/contasPagar';

interface FiltrosCardProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    options: Options;
    onClearFilters: () => void;
}

export function FiltrosCard({
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    options,
    onClearFilters
}: FiltrosCardProps) {
    const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
        value,
        label: (config as any).label
    }));

    return (
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
                    <Button variant="outline" size="sm" onClick={onClearFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Limpar Filtros
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
