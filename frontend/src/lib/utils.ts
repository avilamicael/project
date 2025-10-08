import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_CONFIG = {
  vencida: {
    label: "Vencida",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "🔴"
  },
  pendente: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "🟡"
  },
  paga: {
    label: "Paga",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "🟢"
  },
  paga_parcial: {
    label: "Paga Parcial",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "🔵"
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-gray-100 text-gray-800 border-gray-200",
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
  return new Date(date).toLocaleDateString('pt-BR');
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
