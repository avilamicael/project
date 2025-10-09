import { DateRange } from "react-day-picker";
import { StatusType } from "@/lib/utils";

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor_id: string;
  fornecedor_nome?: string;
  filial_id: string;
  filial_nome?: string;
  categoria_id: string;
  categoria_nome?: string;
  forma_pagamento_nome?: string;
  valor_original: number | string;
  valor_final?: number | string;
  valor_restante?: number | string;
  desconto?: number | string;
  juros?: number | string;
  multa?: number | string;
  valor_pago?: number | string;
  data_emissao: string | Date;
  data_vencimento: string | Date;
  data_pagamento?: string | Date | null;
  status: StatusType;
  status_display?: string;
  esta_vencida?: boolean;
  e_parcelada?: boolean;
  parcela_atual?: number;
  total_parcelas?: number;
  observacoes?: string;
}

export interface Filial {
  id: string;
  nome: string;
}

export interface Categoria {
  id: string;
  nome: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
}

export interface Option {
  value: number | string;
  label: string;
}

export interface Filters {
  status: (string | number)[];
  filial: (string | number)[];
  categoria: (string | number)[];
  fornecedor: (string | number)[];
  dataVencimento?: DateRange;
  dataPagamento?: DateRange;
}

export interface Options {
  filiais: Option[];
  categorias: Option[];
  fornecedores: Option[];
}

export interface Estatisticas {
  totalPendente: number;
  vencidas: {
    count: number;
    valor: number;
  };
  pagasHoje: number;
  proximosVencimentos: number;
}
