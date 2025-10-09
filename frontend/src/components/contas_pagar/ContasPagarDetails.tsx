import React from 'react';
import type { ContaPagar } from '@/types/contasPagar';
import { formatDate, formatCurrency, calcularValorFinal, calcularValorRestante, isVencida, cn, STATUS_CONFIG } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Download, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contasPagarService } from '@/services/contas-pagar.service';

interface ContasPagarDetailsProps {
    conta: ContaPagar | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPagamentoConfirmado: () => void;
}

export function ContasPagarDetails({
    conta,
    open,
    onOpenChange,
    onPagamentoConfirmado
}: ContasPagarDetailsProps) {
    const { toast } = useToast();

    const handlePagamento = async () => {
        if (!conta) return;

        const valorInput = (document.getElementById('valor-pagamento') as HTMLInputElement)?.value;
        const multaInput = window.prompt('Informe o valor da multa (se houver):', String(conta.multa ?? "0"));
        const jurosInput = window.prompt('Informe o valor dos juros (se houver):', String(conta.juros ?? "0"));
        const dataInput = (document.getElementById('data-pagamento') as HTMLInputElement)?.value;

        const valor_pago = valorInput ? Number(valorInput) : calcularValorRestante(conta);
        const multa = multaInput ? Number(multaInput) : 0;
        const juros = jurosInput ? Number(jurosInput) : 0;
        const data_pagamento = dataInput || new Date().toISOString().split('T')[0];

        try {
            await contasPagarService.pagar(String(conta.id), {
                valor_pago: valor_pago + multa + juros,
                data_pagamento
            });

            toast({
                title: `Conta "${conta.descricao}" marcada como paga`,
                description: `Valor: ${formatCurrency(valor_pago + multa + juros)} | Multa: ${formatCurrency(multa)} | Juros: ${formatCurrency(juros)}`
            });

            onOpenChange(false);
            onPagamentoConfirmado();
        } catch (error) {
            const e = error as any;
            toast({
                title: "Erro ao registrar pagamento",
                description: e?.message || String(error)
            });
        }
    };

    if (!conta) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
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
                                <p className="font-medium">{conta.descricao}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Status</Label>
                                <div className="mt-1">
                                    <Badge
                                        variant="outline"
                                        className={STATUS_CONFIG[conta.status]?.color}
                                    >
                                        {STATUS_CONFIG[conta.status]?.label}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Fornecedor</Label>
                                <p className="font-medium">{conta.fornecedor_nome || '-'}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Filial</Label>
                                <p className="font-medium">{conta.filial_nome || '-'}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Categoria</Label>
                                <p className="font-medium">{conta.categoria_nome || '-'}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Número do Documento</Label>
                                <p className="font-medium">{conta.numero_documento || '-'}</p>
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
                                    {formatCurrency(conta.valor_original)}
                                </p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Desconto</Label>
                                <p className="font-medium text-green-600">
                                    {formatCurrency(conta.desconto || 0)}
                                </p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Juros</Label>
                                <p className="font-medium text-orange-600">
                                    {formatCurrency(conta.juros || 0)}
                                </p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Multa</Label>
                                <p className="font-medium text-red-600">
                                    {formatCurrency(conta.multa || 0)}
                                </p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Valor Final</Label>
                                <p className="font-bold text-xl text-primary">
                                    {formatCurrency(calcularValorFinal(conta))}
                                </p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Valor Pago</Label>
                                <p className="font-medium text-green-600 text-lg">
                                    {formatCurrency(conta.valor_pago || 0)}
                                </p>
                            </div>

                            <div className="col-span-2">
                                <Label className="text-muted-foreground">Valor Restante</Label>
                                <p className="font-bold text-2xl text-red-600">
                                    {formatCurrency(calcularValorRestante(conta))}
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
                                <p className="font-medium">{formatDate(conta.data_emissao)}</p>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Data de Vencimento</Label>
                                <p className={cn(
                                    "font-medium",
                                    isVencida(conta.data_vencimento, conta.status) && "text-red-600"
                                )}>
                                    {formatDate(conta.data_vencimento)}
                                </p>
                            </div>

                            {conta.data_pagamento && (
                                <div>
                                    <Label className="text-muted-foreground">Data de Pagamento</Label>
                                    <p className="font-medium">{formatDate(conta.data_pagamento)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Observações */}
                    {conta.observacoes && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Observações</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {conta.observacoes}
                            </p>
                        </div>
                    )}

                    {/* Forma de Pagamento */}
                    {conta.forma_pagamento_nome && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Forma de Pagamento</h3>
                            <Badge variant="outline">{conta.forma_pagamento_nome}</Badge>
                        </div>
                    )}

                    {/* Registrar Pagamento */}
                    {conta.status !== 'paga' && conta.status !== 'cancelada' && (
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
                                        defaultValue={calcularValorRestante(conta)}
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

                                <Button
                                    className="w-full"
                                    onClick={handlePagamento}
                                >
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
            </SheetContent>
        </Sheet>
    );
}