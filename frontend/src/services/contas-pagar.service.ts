/**
 * Serviço de Contas a Pagar
 * Responsável por chamadas à API relacionadas a contas a pagar
 */

import { api } from './api';
import type { ContaPagar } from '@/types/contasPagar';

// Tipo para criação de conta (campos necessários para o formulário)
export interface ContaPagarCreate {
  id?: string;
  filial: string;
  fornecedor: string;
  categoria: string;
  descricao: string;
  valor_original: number;
  desconto?: number;
  juros?: number;
  multa?: number;
  data_emissao?: string | Date;
  data_vencimento: string | Date;
  forma_pagamento?: string;
  status?: 'pendente' | 'paga' | 'vencida' | 'cancelada';
  numero_boleto?: string;
  notas_fiscais?: string;
  observacoes?: string;
  anexo?: File;
}

export interface Filial {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  telefone?: string;
  email?: string;
  ativa: boolean;
  endereco?: string;

}

export interface Fornecedor {
  id: string;
  nome: string;
  nome_fantasia?: string;
  tipo_pessoa: 'fisica' | 'juridica';
  cpf_cnpj: string;
  inscricao_estadual?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  ativo: boolean;
  endereco?: string;
  cep?: string;
  observacoes?: string;

}

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor?: string;
  ativa: boolean;
}

export interface FormaPagamento {
  id: string;
  nome: string;
  ativa: boolean;
}

// Tipo para resposta paginada do Django REST Framework
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Função helper para buscar TODOS os resultados de endpoints paginados
 */
async function fetchAllPages<T>(url: string): Promise<T[]> {
  let allResults: T[] = [];
  let nextUrl: string | null = url;
  
  while (nextUrl) {
    const response: { data: PaginatedResponse<T> } = await api.get<PaginatedResponse<T>>(nextUrl);
    allResults = [...allResults, ...response.data.results];
    nextUrl = response.data.next;
    
    // Previne loop infinito
    if (allResults.length > 50000) {
      console.warn('⚠️ Limite de segurança atingido ao buscar páginas');
      break;
    }
  }
  
  return allResults;
}

export interface ContasPagarEstatisticas {
  total_pendente: number;
  vencidas_count: number;
  vencidas_valor: number;
  pagas_hoje: number;
  proximos_vencimentos: number;
}

export const contasPagarService = {
  /**
   * Lista todas as contas a pagar
   */
  listar: async (params: {
    page?: number;
    page_size?: number;
    status?: string[];
    filial?: string[];
    categoria?: string[];
    fornecedor?: string[];
    data_vencimento_inicio?: string;
    data_vencimento_fim?: string;
    data_pagamento_inicio?: string;
    data_pagamento_fim?: string;
    search?: string;
  } = {}): Promise<PaginatedResponse<ContaPagar>> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());

    // Filtros - enviar como valores separados por vírgula para BaseInFilter
    if (params.status?.length) query.append('status', params.status.join(','));
    if (params.filial?.length) query.append('filial', params.filial.join(','));
    if (params.categoria?.length) query.append('categoria', params.categoria.join(','));
    if (params.fornecedor?.length) query.append('fornecedor', params.fornecedor.join(','));
    if (params.data_vencimento_inicio) query.append('data_vencimento_inicio', params.data_vencimento_inicio);
    if (params.data_vencimento_fim) query.append('data_vencimento_fim', params.data_vencimento_fim);
    if (params.data_pagamento_inicio) query.append('data_pagamento_inicio', params.data_pagamento_inicio);
    if (params.data_pagamento_fim) query.append('data_pagamento_fim', params.data_pagamento_fim);
    if (params.search) query.append('search', params.search);

    const url = `/financeiro/contas-pagar/?${query.toString()}`;
    console.log('🌐 URL da requisição:', url);

    const response = await api.get<PaginatedResponse<ContaPagar>>(url);
    return response.data;
  },

  /**
   * Busca estatísticas agregadas de contas a pagar
   */
  estatisticas: async (): Promise<ContasPagarEstatisticas> => {
    const response = await api.get<ContasPagarEstatisticas>('/financeiro/contas-pagar/estatisticas/');
    return response.data;
  },


  /**
   * Busca uma conta específica por ID
   */
  buscarPorId: async (id: string): Promise<ContaPagar> => {
    const response = await api.get<ContaPagar>(`/financeiro/contas-pagar/${id}/`);
    return response.data;
  },

  /**
   * Cria uma nova conta a pagar
   */
  criar: async (data: ContaPagarCreate): Promise<ContaPagar> => {
    // Se tiver anexo, envia como FormData
    if (data.anexo) {
      const formData = new FormData();

      // Adiciona todos os campos
      formData.append('filial', data.filial);
      formData.append('fornecedor', data.fornecedor);
      formData.append('categoria', data.categoria);
      formData.append('descricao', data.descricao);
      formData.append('valor_original', data.valor_original.toString());
      formData.append('data_vencimento', typeof data.data_vencimento === 'string' ? data.data_vencimento : data.data_vencimento.toISOString());

      // Campos opcionais
      if (data.forma_pagamento) formData.append('forma_pagamento', data.forma_pagamento);
      if (data.numero_boleto) formData.append('numero_boleto', data.numero_boleto);
      if (data.notas_fiscais) formData.append('notas_fiscais', data.notas_fiscais);
      if (data.observacoes) formData.append('observacoes', data.observacoes);

      // Adiciona o arquivo
      formData.append('anexo', data.anexo);

      const response = await api.post<ContaPagar>('/financeiro/contas-pagar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Se não tiver anexo, envia JSON normal
    const response = await api.post<ContaPagar>('/financeiro/contas-pagar/', data);
    return response.data;
  },

  /**
   * Atualiza uma conta existente
   */
  atualizar: async (id: string, data: Partial<ContaPagarCreate>): Promise<ContaPagar> => {
    const response = await api.put<ContaPagar>(`/financeiro/contas-pagar/${id}/`, data);
    return response.data;
  },

  /**
   * Deleta uma conta
   */
  deletar: async (id: string): Promise<void> => {
    await api.delete(`/financeiro/contas-pagar/${id}/`);
  },

  /**
   * Lista contas pendentes
   */
  listarPendentes: async (): Promise<ContaPagar[]> => {
    const response = await api.get<PaginatedResponse<ContaPagar>>('/financeiro/contas-pagar/pendentes/');
    return response.data.results;
  },

  /**
   * Lista contas vencidas
   */
  listarVencidas: async (): Promise<ContaPagar[]> => {
    const response = await api.get<PaginatedResponse<ContaPagar>>('/financeiro/contas-pagar/vencidas/');
    return response.data.results;
  },

  /**
   * Lista contas pagas
   */
  listarPagas: async (): Promise<ContaPagar[]> => {
    const response = await api.get<PaginatedResponse<ContaPagar>>('/financeiro/contas-pagar/pagas/');
    return response.data.results;
  },

  /**
   * Marca uma conta como paga
   */
  pagar: async (id: string, data: { valor_pago: number; data_pagamento: string }): Promise<ContaPagar> => {
    const response = await api.post<ContaPagar>(`/financeiro/contas-pagar/${id}/pagar/`, data);
    return response.data;
  },

  /**
   * Cancela uma conta
   */
  cancelar: async (id: string): Promise<ContaPagar> => {
    const response = await api.post<ContaPagar>(`/financeiro/contas-pagar/${id}/cancelar/`);
    return response.data;
  },
};

// Serviços auxiliares para dados de formulário

export const filiaisService = {
  listar: async (): Promise<Filial[]> => {
    return fetchAllPages<Filial>('/financeiro/filiais/');
  },

  criar: async (data: Omit<Filial, 'id'>): Promise<Filial> => {
    const response = await api.post<Filial>('/financeiro/filiais/', data);
    return response.data;
  },
};

export const fornecedoresService = {
  listar: async (): Promise<Fornecedor[]> => {
    return fetchAllPages<Fornecedor>('/financeiro/fornecedores/');
  },

  criar: async (data: Omit<Fornecedor, 'id'>): Promise<Fornecedor> => {
    const response = await api.post<Fornecedor>('/financeiro/fornecedores/', data);
    return response.data;
  },
};

export const categoriasService = {
  listar: async (): Promise<Categoria[]> => {
    return fetchAllPages<Categoria>('/financeiro/categorias/');
  },

  criar: async (data: Omit<Categoria, 'id'>): Promise<Categoria> => {
    const response = await api.post<Categoria>('/financeiro/categorias/', data);
    return response.data;
  },
};

export const formasPagamentoService = {
  listar: async (): Promise<FormaPagamento[]> => {
    return fetchAllPages<FormaPagamento>('/financeiro/formas-pagamento/');
  },

  criar: async (data: Omit<FormaPagamento, 'id'>): Promise<FormaPagamento> => {
    const response = await api.post<FormaPagamento>('/financeiro/formas-pagamento/', data);
    return response.data;
  },
};
