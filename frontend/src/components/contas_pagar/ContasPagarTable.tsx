import React, { useState } from 'react';
import type { ContaPagar } from '@/types/contasPagar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, calcularValorFinal, calcularValorRestante, isVencida, cn } from '@/lib/utils';
import { STATUS_CONFIG } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, Repeat } from 'lucide-react';

type SortKey = 'descricao' | 'fornecedor_nome' | 'filial_nome' | 'categoria_nome' | 'data_vencimento' | 'valor_original' | 'valor_pago' | 'status';
type SortOrder = 'asc' | 'desc' | null;

interface ContasPagarTableProps {
    contas: ContaPagar[];
    selectedContas: string[];
    loading: boolean;
    selectAllMode?: boolean;
    totalContas?: number;
    onSelectAll: () => void;
    onSelectConta: (id: string) => void;
    onViewDetails: (conta: ContaPagar) => void;
}

export function ContasPagarTable({
    contas,
    selectedContas,
    loading,
    selectAllMode = false,
    totalContas = 0,
    onSelectAll,
    onSelectConta,
    onViewDetails
}: ContasPagarTableProps) {
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            if (sortOrder === 'asc') {
                setSortOrder('desc');
            } else if (sortOrder === 'desc') {
                setSortKey(null);
                setSortOrder(null);
            }
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (key: SortKey) => {
        if (sortKey !== key) {
            return <ArrowUpDown className="h-4 w-4" />;
        }
        return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const sortedContas = React.useMemo(() => {
        if (!sortKey || !sortOrder) return contas;

        return [...contas].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            // Handle null/undefined values
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            // Convert to comparable values
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [contas, sortKey, sortOrder]);

    const allSelected = selectAllMode || (selectedContas.length === contas.length && contas.length > 0);

    return (
        <div className="overflow-x-auto">
            {selectAllMode && totalContas > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-2 text-sm text-blue-800 dark:text-blue-200">
                    Todas as <strong>{totalContas}</strong> contas estão selecionadas (todas as páginas)
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={onSelectAll}
                            />
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 h-8 data-[state=open]:bg-accent"
                                onClick={() => handleSort('descricao')}
                            >
                                Descrição
                                {getSortIcon('descricao')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 h-8 data-[state=open]:bg-accent"
                                onClick={() => handleSort('fornecedor_nome')}
                            >
                                Fornecedor
                                {getSortIcon('fornecedor_nome')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 h-8 data-[state=open]:bg-accent"
                                onClick={() => handleSort('filial_nome')}
                            >
                                Filial
                                {getSortIcon('filial_nome')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 h-8 data-[state=open]:bg-accent"
                                onClick={() => handleSort('categoria_nome')}
                            >
                                Categoria
                                {getSortIcon('categoria_nome')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 h-8 data-[state=open]:bg-accent"
                                onClick={() => handleSort('data_vencimento')}
                            >
                                Vencimento
                                {getSortIcon('data_vencimento')}
                            </Button>
                        </TableHead>
                        <TableHead className="text-right">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 h-8 data-[state=open]:bg-accent"
                                onClick={() => handleSort('valor_original')}
                            >
                                Valor Bruto
                                {getSortIcon('valor_original')}
                            </Button>
                        </TableHead>
                        <TableHead className="text-right">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 h-8 data-[state=open]:bg-accent"
                                onClick={() => handleSort('valor_pago')}
                            >
                                Valor Pago
                                {getSortIcon('valor_pago')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 h-8 data-[state=open]:bg-accent"
                                onClick={() => handleSort('status')}
                            >
                                Status
                                {getSortIcon('status')}
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                                Carregando...
                            </TableCell>
                        </TableRow>
                    ) : sortedContas.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                Nenhuma conta encontrada
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedContas.map((conta) => {
                            const vencida = isVencida(conta.data_vencimento, conta.status);

                            return (
                                <TableRow
                                    key={conta.id}
                                    data-conta-id={conta.id}
                                    tabIndex={0}
                                    className={cn(
                                        "cursor-pointer transition-colors",
                                        selectedContas.includes(conta.id) && "bg-muted",
                                        vencida
                                            ? "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedContas.includes(conta.id)}
                                            onCheckedChange={() => onSelectConta(conta.id)}
                                        />
                                    </TableCell>
                                    <TableCell
                                        className="font-medium"
                                        onClick={() => onViewDetails(conta)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{conta.descricao}</span>
                                            {conta.e_recorrente && (
                                                <span title="Conta recorrente">
                                                    <Repeat className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{conta.fornecedor_nome || '-'}</TableCell>
                                    <TableCell>{conta.filial_nome || '-'}</TableCell>
                                    <TableCell>{conta.categoria_nome || '-'}</TableCell>
                                    <TableCell>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(Number(conta.valor_original))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(Number(conta.valor_pago || 0))}
                                    </TableCell>
                                    <TableCell>
                                        {(() => {
                                            const statusInfo = STATUS_CONFIG[conta.status as keyof typeof STATUS_CONFIG];
                                            return (
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "flex items-center gap-1 border",
                                                        statusInfo?.color
                                                    )}
                                                >
                                                    <span>{statusInfo?.icon}</span>
                                                    <span>{statusInfo?.label}</span>
                                                </Badge>
                                            );
                                        })()}
                                    </TableCell>

                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}