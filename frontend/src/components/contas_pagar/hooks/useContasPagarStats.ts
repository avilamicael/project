import { useState, useEffect } from 'react';
import { contasPagarService } from '@/services/contas-pagar.service';

interface ContasPagarStats {
    totalPendente: number;
    vencidas: {
        count: number;
        valor: number;
    };
    pagasHoje: number;
    proximosVencimentos: number;
}

export function useContasPagarStats(refetchTrigger?: any): ContasPagarStats {
    const [stats, setStats] = useState<ContasPagarStats>({
        totalPendente: 0,
        vencidas: { count: 0, valor: 0 },
        pagasHoje: 0,
        proximosVencimentos: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await contasPagarService.estatisticas();
                setStats({
                    totalPendente: data.total_pendente,
                    vencidas: {
                        count: data.vencidas_count,
                        valor: data.vencidas_valor
                    },
                    pagasHoje: data.pagas_hoje,
                    proximosVencimentos: data.proximos_vencimentos
                });
            } catch (error) {
                console.error('Erro ao buscar estatísticas:', error);
            }
        };

        fetchStats();
    }, [refetchTrigger]);

    return stats;
}
