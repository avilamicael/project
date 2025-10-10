import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency, calcularValorRestante, cn } from '@/lib/utils';
import type { ContaPagar } from '@/types/contasPagar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DialogPagamentoProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contas: ContaPagar[];
    ids: string[];
    loading: boolean;
    onConfirmar: (pagamentos: PagamentoData[]) => void;
}

export interface PagamentoData {
    id: string;
    valor: number;
    multa: number;
    juros: number;
    data: string;
}

export function DialogPagamento({
    open,
    onOpenChange,
    contas,
    ids,
    loading,
    onConfirmar
}: DialogPagamentoProps) {
    // Estado para armazenar os dados de cada conta (chave pode ser number ou string)
    const [pagamentosData, setPagamentosData] = useState<Record<string | number, PagamentoData>>({});

    // Inicializar dados quando o dialog abrir
    useEffect(() => {
        if (open && ids.length > 0) {
            const initialData: Record<string | number, PagamentoData> = {};
            ids.forEach(id => {
                const conta = contas.find(c => c.id === id);
                if (conta) {
                    initialData[id] = {
                        id,
                        valor: calcularValorRestante(conta),
                        multa: parseFloat(conta.multa as string) || 0,
                        juros: parseFloat(conta.juros as string) || 0,
                        data: new Date().toISOString().split('T')[0]
                    };
                }
            });
            setPagamentosData(initialData);
        } else if (!open) {
            // Limpar dados ao fechar
            setPagamentosData({});
        }
    }, [open, ids, contas]);

    const updatePagamento = (id: number | string, field: keyof Omit<PagamentoData, 'id'>, value: string | number) => {
        setPagamentosData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: typeof value === 'string' ? (field === 'data' ? value : Number(value)) : value
            }
        }));
    };

    const handleConfirmar = () => {
        const pagamentos = Object.values(pagamentosData);

        // Validar se todos os valores são válidos
        const invalid = pagamentos.some(p =>
            isNaN(p.valor) || p.valor <= 0 ||
            isNaN(p.multa) || isNaN(p.juros) ||
            !p.data
        );

        if (invalid) {
            alert('Por favor, preencha todos os campos com valores válidos.');
            return;
        }

        onConfirmar(pagamentos);
    };

    const contasSelecionadas = contas.filter(c => ids.includes(c.id));
    const totalGeral = Object.values(pagamentosData).reduce((acc, p) =>
        acc + (p.valor || 0) + (p.multa || 0) + (p.juros || 0), 0
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Registrar Pagamento</DialogTitle>
                    <DialogDescription>
                        {ids.length === 1 ? (
                            <>
                                Preencha os dados do pagamento para a conta selecionada.
                            </>
                        ) : (
                            <>
                                Pagamento em lote de <b>{ids.length}</b> contas. Preencha os dados de cada conta individualmente.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {Object.keys(pagamentosData).length === 0 && contasSelecionadas.length > 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Carregando dados...</p>
                        </div>
                    </div>
                ) : (
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className={cn(
                        "space-y-4",
                        ids.length > 1 ? "grid grid-cols-2 gap-4" : "space-y-6"
                    )}>
                        {contasSelecionadas.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhuma conta encontrada
                            </div>
                        ) : (
                            contasSelecionadas.map((conta) => {
                                const pagamento = pagamentosData[conta.id];
                                if (!pagamento) return null;

                            const totalConta = (pagamento.valor || 0) + (pagamento.multa || 0) + (pagamento.juros || 0);

                            return (
                                <div key={conta.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                                    {/* Cabeçalho da Conta */}
                                    <div className="flex items-start justify-between pb-2 border-b">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm truncate">{conta.descricao}</h4>
                                            <div className="flex flex-col mt-1 text-xs text-muted-foreground">
                                                <span className="truncate">
                                                    <span className="font-medium text-foreground">{conta.fornecedor_nome}</span>
                                                </span>
                                                <span className="truncate">
                                                    Filial: <span className="font-medium text-foreground">{conta.filial_nome}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campos de Input - Layout em Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`multa-${conta.id}`}>
                                                Multa (R$)
                                            </Label>
                                            <Input
                                                id={`multa-${conta.id}`}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0,00"
                                                value={pagamento.multa}
                                                onChange={e => updatePagamento(conta.id, 'multa', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`juros-${conta.id}`}>
                                                Juros (R$)
                                            </Label>
                                            <Input
                                                id={`juros-${conta.id}`}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0,00"
                                                value={pagamento.juros}
                                                onChange={e => updatePagamento(conta.id, 'juros', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`data-${conta.id}`}>
                                                Data do Pagamento
                                            </Label>
                                            <Input
                                                id={`data-${conta.id}`}
                                                type="date"
                                                value={pagamento.data}
                                                onChange={e => updatePagamento(conta.id, 'data', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`valor-pago-${conta.id}`}>
                                                Valor Total a Pagar
                                            </Label>
                                            <Input
                                                id={`valor-pago-${conta.id}`}
                                                type="text"
                                                value={formatCurrency(totalConta)}
                                                disabled
                                                className="bg-muted font-semibold"
                                            />
                                        </div>
                                    </div>

                                    {/* Resumo da Conta */}
                                    <div className="pt-2 border-t space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Valor Original:</span>
                                            <span className="font-medium">{formatCurrency(conta.valor_original)}</span>
                                        </div>
                                        <div className="flex justify-between pt-1 border-t">
                                            <span className="font-medium">Total a Pagar:</span>
                                            <span className="text-base font-bold text-primary">
                                                {formatCurrency(totalConta)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
                )}

                {/* Resumo Total (se múltiplas contas) */}
                {ids.length > 1 && (
                    <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between px-4 py-3 bg-primary/5 rounded-lg">
                            <div className="text-sm font-medium">
                                Total de {ids.length} conta(s) selecionada(s)
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Total Geral</div>
                                <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(totalGeral)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} variant="outline" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmar} disabled={loading}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {loading ? 'Processando...' : `Confirmar Pagamento${ids.length > 1 ? 's' : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
