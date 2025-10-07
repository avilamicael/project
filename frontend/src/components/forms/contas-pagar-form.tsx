"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  BanknoteArrowDown,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Componentes customizados
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { CurrencyInput } from "@/components/ui/currency-input";

// Dialogs
import { FilialDialog } from "@/components/dialogs/filial-dialog";
import { FornecedorDialog } from "@/components/dialogs/fornecedor-dialog";
import { CategoriaDialog } from "@/components/dialogs/categoria-dialog";
import { FormaPagamentoDialog } from "@/components/dialogs/forma-pagamento-dialog";

// Services
import {
  filiaisService,
  fornecedoresService,
  categoriasService,
  formasPagamentoService,
} from "@/services/contas-pagar.service";

// Schema de validação
const contasPagarSchema = z.object({
  filial: z.string().min(1, "Filial é obrigatória"),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  tipo_pagamento: z.string(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  data_vencimento: z.date(),
  valor_original: z.number().min(0.01, "Valor deve ser maior que zero"),

  // Campos condicionais para parcelamento
  total_parcelas: z.number().min(1).optional(),

  // Campos condicionais para recorrência
  frequencia_recorrencia: z.string().optional(),

  // Campos opcionais
  forma_pagamento: z.string().optional(),
  notas_fiscais: z.string().optional(),
  numero_boleto: z.string().optional(),
  observacoes: z.string().optional(),
  anexo: z.any().optional(),
});

type ContasPagarFormData = z.infer<typeof contasPagarSchema>;

export default function ContasPagarForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  // Estados para controlar os dialogs
  const [filialDialogOpen, setFilialDialogOpen] = React.useState(false);
  const [fornecedorDialogOpen, setFornecedorDialogOpen] = React.useState(false);
  const [categoriaDialogOpen, setCategoriaDialogOpen] = React.useState(false);
  const [formaPagamentoDialogOpen, setFormaPagamentoDialogOpen] = React.useState(false);

  // Estados para dados da API
  const [filiais, setFiliais] = React.useState<ComboboxOption[]>([]);
  const [fornecedores, setFornecedores] = React.useState<ComboboxOption[]>([]);
  const [categorias, setCategorias] = React.useState<ComboboxOption[]>([]);
  const [formasPagamento, setFormasPagamento] = React.useState<ComboboxOption[]>([]);

  const form = useForm<ContasPagarFormData>({
    resolver: zodResolver(contasPagarSchema),
    defaultValues: {
      filial: "",
      fornecedor: "",
      categoria: "",
      tipo_pagamento: "unico",
      descricao: "",
      valor_original: 0,
      total_parcelas: 1,
      frequencia_recorrencia: "",
      forma_pagamento: "",
      notas_fiscais: "",
      numero_boleto: "",
      observacoes: "",
    },
  });

  const tipoPagamento = form.watch("tipo_pagamento");

  // Carrega dados iniciais
  React.useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoadingData(true);
    setErrorMessage("");

    try {
      // Tenta carregar cada endpoint separadamente para identificar qual está falhando
      try {
        const filiaisData = await filiaisService.listar();
        setFiliais(
          filiaisData
            .filter((f) => f.ativa)
            .map((f) => ({ value: f.id, label: f.nome.toUpperCase() }))
        );
      } catch (error: any) {
        console.error("❌ Erro ao carregar filiais:", error);
        console.error("Detalhes:", error.response?.data || error.message);
      }

      try {
        const fornecedoresData = await fornecedoresService.listar();
        setFornecedores(
          fornecedoresData
            .filter((f) => f.ativo)
            .map((f) => ({
              value: f.id,
              label: (f.nome_fantasia || f.nome).toUpperCase()
            }))
        );
      } catch (error: any) {
        console.error("❌ Erro ao carregar fornecedores:", error);
        console.error("Detalhes:", error.response?.data || error.message);
      }

      try {
        const categoriasData = await categoriasService.listar();
        setCategorias(
          categoriasData
            .filter((c) => c.ativa && c.tipo === 'despesa')
            .map((c) => ({ value: c.id, label: c.nome.toUpperCase() }))
        );
      } catch (error: any) {
        console.error("❌ Erro ao carregar categorias:", error);
        console.error("Detalhes:", error.response?.data || error.message);
      }

      try {
        const formasPagData = await formasPagamentoService.listar();
        setFormasPagamento(
          formasPagData
            .filter((fp) => fp.ativa)
            .map((fp) => ({ value: fp.id, label: fp.nome.toUpperCase() }))
        );
      } catch (error: any) {
        console.error("❌ Erro ao carregar formas de pagamento:", error);
        console.error("Detalhes:", error.response?.data || error.message);
      }


    } catch (error: any) {
      console.error("❌ Erro geral ao carregar dados:", error);

      let mensagemErro = "Erro ao carregar dados. ";

      if (error.message === "Network Error") {
        mensagemErro += "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
      } else if (error.response?.status === 401) {
        mensagemErro += "Você precisa fazer login primeiro.";
      } else if (error.response?.status === 403) {
        mensagemErro += "Você não tem permissão para acessar esses dados.";
      } else if (error.response?.status === 404) {
        mensagemErro += "Endpoints da API não encontrados. Verifique as URLs.";
      } else if (error.response?.status === 500) {
        mensagemErro += "Erro no servidor. Verifique os logs do Django.";
      } else {
        mensagemErro += error.message || "Erro desconhecido.";
      }

      setErrorMessage(mensagemErro);
      console.error("💡 Dica: Abra o DevTools (F12) → Console e Network para mais detalhes");
      console.error("💡 Verifique se o Django está rodando e o CORS está configurado");
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: ContasPagarFormData) => {
    setIsLoading(true);

    try {
      // Formata os dados para o backend
      const payload: any = {
        filial: data.filial,
        fornecedor: data.fornecedor,
        categoria: data.categoria,
        descricao: data.descricao,
        valor_original: data.valor_original,
        data_vencimento: data.data_vencimento.toISOString().split('T')[0],
        forma_pagamento: data.forma_pagamento || undefined,
        numero_boleto: data.numero_boleto || undefined,
        notas_fiscais: data.notas_fiscais || undefined,
        observacoes: data.observacoes || undefined,
      };

      // Adiciona o anexo se existir
      if (data.anexo) {
        payload.anexo = data.anexo;
      }

      alert("Conta cadastrada com sucesso!");
      form.reset();
    } catch (error: any) {
      console.error("❌ Erro ao cadastrar conta:", error);
      console.error("Detalhes:", error.response?.data || error.message);

      const errorMessage = error.response?.data?.message
        || error.response?.data?.detail
        || error.message
        || "Erro ao cadastrar conta";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = () => {
    form.reset();
    form.clearErrors();
  };

  // Handlers para adicionar novos itens
  const handleFilialAdded = async (data: any) => {
    await carregarDados();
  };

  const handleFornecedorAdded = async (data: any) => {
    await carregarDados();
  };

  const handleCategoriaAdded = async (data: any) => {
    await carregarDados();
  };

  const handleFormaPagamentoAdded = async (data: any) => {
    await carregarDados();
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive mb-1">Erro ao carregar dados</h3>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium">Checklist de verificação:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Backend Django está rodando?</li>
                <li>URL da API está correta no arquivo .env?</li>
                <li>CORS está configurado no Django?</li>
                <li>Você fez login?</li>
                <li>Endpoints da API existem?</li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                💡 Abra o DevTools (F12) → Console e Network para mais detalhes
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={carregarDados} variant="outline">
            <Loader2 className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onReset={onReset}
          className="space-y-6"
        >
          {/* Seção 1: Informações Básicas (4 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filial */}
            <FormField
              control={form.control}
              name="filial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FILIAL *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={filiais}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="SELECIONE"
                      searchPlaceholder="Buscar filial..."
                      emptyMessage="Nenhuma filial encontrada"
                      onAddNew={() => setFilialDialogOpen(true)}
                      addNewLabel="Adicionar nova filial"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fornecedor */}
            <FormField
              control={form.control}
              name="fornecedor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FORNECEDOR *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={fornecedores}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="SELECIONE"
                      searchPlaceholder="Buscar fornecedor..."
                      emptyMessage="Nenhum fornecedor encontrado"
                      onAddNew={() => setFornecedorDialogOpen(true)}
                      addNewLabel="Adicionar novo fornecedor"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CATEGORIA *</FormLabel>
                  <FormControl>
                    <Combobox
                      options={categorias}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="SELECIONE"
                      searchPlaceholder="Buscar categoria..."
                      emptyMessage="Nenhuma categoria encontrada"
                      onAddNew={() => setCategoriaDialogOpen(true)}
                      addNewLabel="Adicionar nova categoria"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Pagamento */}
            <FormField
              control={form.control}
              name="tipo_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TIPO PAGAMENTO *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="SELECIONE" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unico">ÚNICO</SelectItem>
                        <SelectItem value="parcelado">PARCELADO</SelectItem>
                        <SelectItem value="recorrente">RECORRENTE</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Seção 2: Descrição, Data e Valor (3 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DESCRIÇÃO *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="INFORME A DESCRIÇÃO DA CONTA"
                      type="text"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data de Vencimento */}
            <FormField
              control={form.control}
              name="data_vencimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DATA DE VENCIMENTO *</FormLabel>
                  <FormControl>
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="dd/mm/yy"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor Original */}
            <FormField
              control={form.control}
              name="valor_original"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VALOR ORIGINAL *</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="R$ 0,00"
                      icon={<BanknoteArrowDown className="size-4" strokeWidth={2} />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Seção 3: Campos Condicionais (Parcelamento ou Recorrência) */}
          {tipoPagamento === "parcelado" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="total_parcelas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NÚMERO DE PARCELAS *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Ex: 12"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {tipoPagamento === "recorrente" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="frequencia_recorrencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FREQUÊNCIA *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="SELECIONE" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semanal">SEMANAL</SelectItem>
                          <SelectItem value="quinzenal">QUINZENAL</SelectItem>
                          <SelectItem value="mensal">MENSAL</SelectItem>
                          <SelectItem value="bimestral">BIMESTRAL</SelectItem>
                          <SelectItem value="trimestral">TRIMESTRAL</SelectItem>
                          <SelectItem value="semestral">SEMESTRAL</SelectItem>
                          <SelectItem value="anual">ANUAL</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Seção 4: Detalhes Adicionais (3 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Forma de Pagamento */}
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FORMA DE PAGAMENTO</FormLabel>
                  <FormControl>
                    <Combobox
                      options={formasPagamento}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      placeholder="SELECIONE"
                      searchPlaceholder="Buscar forma de pagamento..."
                      emptyMessage="Nenhuma forma encontrada"
                      onAddNew={() => setFormaPagamentoDialogOpen(true)}
                      addNewLabel="Adicionar nova forma"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas Fiscais */}
            <FormField
              control={form.control}
              name="notas_fiscais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NOTAS FISCAIS</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 123, 456, 789"
                      type="text"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Número do Boleto */}
            <FormField
              control={form.control}
              name="numero_boleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NÚMERO DO BOLETO</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Somente números"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Seção 5: Observações e Anexo (2 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Observações - 2 colunas */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>OBSERVAÇÕES</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre esta conta..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anexo - 1 coluna */}
            <FormField
              control={form.control}
              name="anexo"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>ANEXO</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file);
                        }}
                        {...field}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center gap-2 w-full h-[100px] border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-500 text-center px-2">
                          {value?.name || "Clique para adicionar"}
                        </span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="reset"
              variant="outline"
              disabled={isLoading}
            >
              Limpar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar Conta
            </Button>
          </div>
        </form>
      </Form>

      {/* Dialogs para cadastro rápido */}
      <FilialDialog
        open={filialDialogOpen}
        onOpenChange={setFilialDialogOpen}
        onSuccess={handleFilialAdded}
      />

      <FornecedorDialog
        open={fornecedorDialogOpen}
        onOpenChange={setFornecedorDialogOpen}
        onSuccess={handleFornecedorAdded}
      />

      <CategoriaDialog
        open={categoriaDialogOpen}
        onOpenChange={setCategoriaDialogOpen}
        onSuccess={handleCategoriaAdded}
        tipoFixo="despesa"
      />

      <FormaPagamentoDialog
        open={formaPagamentoDialogOpen}
        onOpenChange={setFormaPagamentoDialogOpen}
        onSuccess={handleFormaPagamentoAdded}
      />
    </>
  );
}
