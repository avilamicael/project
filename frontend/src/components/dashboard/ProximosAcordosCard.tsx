import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContaPagar } from "@/types/contasPagar";
import { formatCurrency } from "@/lib/utils";
import { Calendar, AlertCircle, Clock, DollarSign, Eye } from "lucide-react";
import { format, differenceInDays, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProximosAcordosCardProps {
  contas: ContaPagar[];
  loading?: boolean;
  onViewDetails?: (conta: ContaPagar) => void;
}

export function ProximosAcordosCard({ contas, loading, onViewDetails }: ProximosAcordosCardProps) {
  const getDataBadge = (dataVencimento: string | Date) => {
    const data = new Date(dataVencimento);
    const hoje = new Date();
    const diasRestantes = differenceInDays(data, hoje);

    if (isToday(data)) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Vence Hoje
        </Badge>
      );
    }

    if (isTomorrow(data)) {
      return (
        <Badge variant="default" className="gap-1 bg-orange-500">
          <Clock className="h-3 w-3" />
          Vence Amanhã
        </Badge>
      );
    }

    if (diasRestantes < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Vencido há {Math.abs(diasRestantes)} dias
        </Badge>
      );
    }

    if (diasRestantes <= 7) {
      return (
        <Badge variant="default" className="gap-1 bg-yellow-500">
          <Clock className="h-3 w-3" />
          {diasRestantes} dias
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="gap-1">
        <Calendar className="h-3 w-3" />
        {diasRestantes} dias
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próxima conta recorrente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próxima conta recorrente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum acordo pendente encontrado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próxima conta recorrente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contas.map((conta) => {
            const valor = typeof conta.valor_original === 'string'
              ? parseFloat(conta.valor_original)
              : conta.valor_original;

            return (
              <div
                key={conta.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{conta.descricao}</h4>
                      {getDataBadge(conta.data_vencimento)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-foreground">
                          {formatCurrency(valor)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(conta.data_vencimento), "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                    </div>

                    {conta.fornecedor_nome && (
                      <p className="text-xs text-muted-foreground">
                        Fornecedor: {conta.fornecedor_nome}
                      </p>
                    )}

                    {conta.frequencia_recorrencia && (
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {conta.frequencia_recorrencia}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {onViewDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(conta)}
                      className="shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
