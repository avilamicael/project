import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FileText, CalendarClock, DollarSign } from "lucide-react";

interface ResumoAcordosCardProps {
  totalAcordos: number;
  proximoVencimento?: {
    descricao: string;
    data: string | Date;
    valor: number;
  };
  totalValorMes: number;
  loading?: boolean;
}

export function ResumoAcordosCard({
  totalAcordos,
  proximoVencimento,
  totalValorMes,
  loading
}: ResumoAcordosCardProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total de Acordos Ativos */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Contas Recorrentes
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-bold text-blue-600">
                  {totalAcordos}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de contas recorrentes pendentes
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximo Vencimento */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Próximo Vencimento
              </p>
              {proximoVencimento ? (
                <>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-xl font-bold text-orange-600 truncate">
                      {proximoVencimento.descricao}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(proximoVencimento.valor)} em{' '}
                    {new Date(proximoVencimento.data).toLocaleDateString('pt-BR')}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-xl font-bold text-muted-foreground">
                      Nenhum
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sem vencimentos próximos
                  </p>
                </>
              )}
            </div>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
              <CalendarClock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total do Mês */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total do Mês
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalValorMes)}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Contas a vencer este mês
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
