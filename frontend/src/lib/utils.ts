import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_CONFIG = {
  vencida: {
    label: "Vencida",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200",
    icon: "🔴"
  },
  pendente: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200",
    icon: "🟡"
  },
  paga: {
    label: "Paga",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
    icon: "🟢"
  },
  paga_parcial: {
    label: "Paga Parcial",
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200",
    icon: "🔵"
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200",
    icon: "⚫"
  }
} as const;

export type StatusType = keyof typeof STATUS_CONFIG;

interface ContaPagar {
  valor_original: number | string;
  desconto?: number | string;
  juros?: number | string;
  multa?: number | string;
  valor_pago?: number | string;
  data_vencimento: string | Date;
  status: StatusType;
}

export const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numericValue || 0);
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const isVencida = (dataVencimento: string | Date, status: StatusType): boolean => {
  if (status === 'paga' || status === 'cancelada') return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);
  return vencimento < hoje;
};

export const calcularValorFinal = (conta: ContaPagar): number => {
  const valorOriginal = parseFloat(String(conta.valor_original)) || 0;
  const desconto = parseFloat(String(conta.desconto)) || 0;
  const juros = parseFloat(String(conta.juros)) || 0;
  const multa = parseFloat(String(conta.multa)) || 0;
  
  return valorOriginal - desconto + juros + multa;
};

export const calcularValorRestante = (conta: ContaPagar): number => {
  const valorFinal = calcularValorFinal(conta);
  const valorPago = parseFloat(String(conta.valor_pago)) || 0;
  return valorFinal - valorPago;
};
