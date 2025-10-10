import { useMemo } from 'react';
import { ContaPagar } from '@/types/contasPagar';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format } from 'date-fns';

export interface DadosSemana {
  semana: string;
  valor: number;
  quantidade: number;
  periodo: string;
}

/**
 * Hook que processa as contas recorrentes e agrupa por semana do mês atual
 */
export function useDadosSemanais(contas: ContaPagar[]) {
  const dadosSemanais = useMemo(() => {
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    // Cria array com as semanas do mês
    const semanas: DadosSemana[] = [];
    let dataAtual = inicioMes;
    let numeroSemana = 1;

    while (dataAtual <= fimMes) {
      const inicioSemana = startOfWeek(dataAtual, { weekStartsOn: 0 }); // Domingo
      const fimSemana = endOfWeek(dataAtual, { weekStartsOn: 0 }); // Sábado

      // Ajusta para não ultrapassar o mês
      const inicioSemanaAjustado = inicioSemana < inicioMes ? inicioMes : inicioSemana;
      const fimSemanaAjustado = fimSemana > fimMes ? fimMes : fimSemana;

      // Filtra contas que vencem nesta semana
      const contasDaSemana = contas.filter(conta => {
        const dataVencimento = new Date(conta.data_vencimento);
        return dataVencimento >= inicioSemanaAjustado && dataVencimento <= fimSemanaAjustado;
      });

      // Calcula o valor total da semana
      const valorTotal = contasDaSemana.reduce((sum, conta) => {
        const valor = typeof conta.valor_original === 'string'
          ? parseFloat(conta.valor_original)
          : conta.valor_original;
        return sum + valor;
      }, 0);

      // Formata o período da semana
      const periodo = `${format(inicioSemanaAjustado, 'dd/MM')} - ${format(fimSemanaAjustado, 'dd/MM')}`;

      semanas.push({
        semana: `Semana ${numeroSemana}`,
        valor: valorTotal,
        quantidade: contasDaSemana.length,
        periodo
      });

      // Avança para a próxima semana
      dataAtual = addDays(fimSemanaAjustado, 1);
      numeroSemana++;
    }

    return semanas;
  }, [contas]);

  // Calcula estatísticas
  const estatisticas = useMemo(() => {
    const totalMes = dadosSemanais.reduce((sum, semana) => sum + semana.valor, 0);
    const mediaSemanal = dadosSemanais.length > 0 ? totalMes / dadosSemanais.length : 0;
    const semanaMaiorValor = dadosSemanais.reduce((max, semana) =>
      semana.valor > max.valor ? semana : max
    , { semana: '', valor: 0, quantidade: 0, periodo: '' });

    return {
      totalMes,
      mediaSemanal,
      semanaMaiorValor
    };
  }, [dadosSemanais]);

  return {
    dadosSemanais,
    estatisticas
  };
}
