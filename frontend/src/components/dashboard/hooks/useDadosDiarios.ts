import { useMemo } from 'react';
import { ContaPagar } from '@/types/contasPagar';
import { startOfMonth, endOfMonth, addDays, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ContaDetalhada {
  fornecedor: string;
  descricao: string;
  valor: number;
}

export interface DadosDia {
  dia: string;
  diaCompleto: string;
  valor: number;
  quantidade: number;
  contas: ContaDetalhada[];
  data: Date;
}

/**
 * Hook que processa as contas recorrentes e agrupa por dia do mês atual
 */
export function useDadosDiarios(contas: ContaPagar[]) {
  const dadosDiarios = useMemo(() => {
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    // Cria array com todos os dias do mês que têm contas
    const diasComContas = new Map<string, DadosDia>();

    contas.forEach(conta => {
      const dataVencimento = new Date(conta.data_vencimento);

      // Verifica se a conta vence no mês atual
      if (dataVencimento >= inicioMes && dataVencimento <= fimMes) {
        const diaKey = format(dataVencimento, 'yyyy-MM-dd');

        const valor = typeof conta.valor_original === 'string'
          ? parseFloat(conta.valor_original)
          : conta.valor_original;

        const contaDetalhada: ContaDetalhada = {
          fornecedor: conta.fornecedor_nome || 'Sem fornecedor',
          descricao: conta.descricao,
          valor
        };

        if (diasComContas.has(diaKey)) {
          const diaExistente = diasComContas.get(diaKey)!;
          diaExistente.valor += valor;
          diaExistente.quantidade += 1;
          diaExistente.contas.push(contaDetalhada);
        } else {
          diasComContas.set(diaKey, {
            dia: format(dataVencimento, 'dd/MM', { locale: ptBR }),
            diaCompleto: format(dataVencimento, "dd 'de' MMMM", { locale: ptBR }),
            valor,
            quantidade: 1,
            contas: [contaDetalhada],
            data: dataVencimento
          });
        }
      }
    });

    // Converte para array e ordena por data
    return Array.from(diasComContas.values()).sort((a, b) =>
      a.data.getTime() - b.data.getTime()
    );
  }, [contas]);

  // Calcula estatísticas
  const estatisticas = useMemo(() => {
    const totalMes = dadosDiarios.reduce((sum, dia) => sum + dia.valor, 0);
    const mediaDiaria = dadosDiarios.length > 0 ? totalMes / dadosDiarios.length : 0;
    const diaMaiorValor = dadosDiarios.reduce((max, dia) =>
      dia.valor > max.valor ? dia : max
    , { dia: '', diaCompleto: '', valor: 0, quantidade: 0, contas: [], data: new Date() });

    return {
      totalMes,
      mediaDiaria,
      diaMaiorValor,
      totalDias: dadosDiarios.length
    };
  }, [dadosDiarios]);

  return {
    dadosDiarios,
    estatisticas
  };
}
