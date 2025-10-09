import React from 'react';
import type { ContaPagar } from '@/types/contasPagar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BatchActionsCardProps {
    selectedContas: string[];
    contas: ContaPagar[];
    contasFiltradas: ContaPagar[];
    totalSelecionado: number;
    selectAllLoading?: boolean;
    onClearSelection: () => void;
    onSelectVisible: () => void;
    onSelectAll: () => void;
    onExport: (onlySelected: boolean) => void;
    onPay: (ids: string[]) => void;
}

export function BatchActionsCard({
    selectedContas,
    contas,
    contasFiltradas,
    totalSelecionado,
    selectAllLoading = false,
    onClearSelection,
    onSelectVisible,
    onSelectAll,
    onExport,
    onPay
}: BatchActionsCardProps) {
    // Se não há contas selecionadas, mostrar apenas botões de seleção
    if (selectedContas.length === 0) {
        return (
            <Card>
                <CardContent className="py-3">
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSelectVisible}
                        >
                            Selecionar Visíveis
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSelectAll}
                            disabled={selectAllLoading}
                        >
                            {selectAllLoading ? 'Carregando...' : 'Selecionar Tudo'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
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
                            onClick={onClearSelection}
                        >
                            Limpar Seleção
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSelectVisible}
                        >
                            Selecionar Visíveis
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSelectAll}
                            disabled={selectAllLoading}
                        >
                            {selectAllLoading ? 'Carregando...' : 'Selecionar Tudo'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExport(true)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Exportar Selecionadas
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onPay(selectedContas)}
                            disabled={selectedContas.length === 0}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Marcar como Paga
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}