import { DateRange } from "react-day-picker";
import { StatusType } from "@/lib/utils";

export interface ContaPagar {
  id: number;
  descricao: string;
  numero_documento?: string;
  fornecedor_id: number;
  fornecedor_nome?: string;
  filial_id: number;
  filial_nome?: string;
  categoria_id: number;
  categoria_nome?: string;
  forma_pagamento_nome?: string;
  valor_original: number | string;
  desconto?: number | string;
  juros?: number | string;
  multa?: number | string;
  valor_pago?: number | string;
  data_emissao: string | Date;
  data_vencimento: string | Date;
  data_pagamento?: string | Date | null;
  status: StatusType;
  observacoes?: string;
}

export interface Filial {
  id: number;
  nome: string;
}

export interface Categoria {
  id: number;
  nome: string;
}

export interface Fornecedor {
  id: number;
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
  dataMovimentacao?: DateRange;
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
