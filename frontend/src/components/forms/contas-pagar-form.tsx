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
  
  // Estados para controlar os dialogs
  const [filialDialogOpen, setFilialDialogOpen] = React.useState(false);
  const [fornecedorDialogOpen, setFornecedorDialogOpen] = React.useState(false);
  const [categoriaDialogOpen, setCategoriaDialogOpen] = React.useState(false);
  const [formaPagamentoDialogOpen, setFormaPagamentoDialogOpen] = React.useState(false);

  // Mock de dados - substituir por dados reais da API
  const [filiais, setFiliais] = React.useState<ComboboxOption[]>([
    { value: "1", label: "KOBRASOL" },
    { value: "2", label: "PALHOÇA" },
  ]);

  const [fornecedores, setFornecedores] = React.useState<ComboboxOption[]>([
    { value: "1", label: "LUXOTTICA" },
    { value: "2", label: "ADAMAS" },
  ]);

  const [categorias, setCategorias] = React.useState<ComboboxOption[]>([
    { value: "1", label: "ENERGIA ELÉTRICA" },
    { value: "2", label: "VALE TRANSPORTE" },
  ]);

  const [formasPagamento, setFormasPagamento] = React.useState<ComboboxOption[]>([
    { value: "1", label: "DINHEIRO" },
    { value: "2", label: "PIX" },
    { value: "3", label: "CARTÃO" },
  ]);

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

  const onSubmit = async (data: ContasPagarFormData) => {
    setIsLoading(true);

    try {
      console.log("Dados do formulário:", data);
      
      // Aqui você fará a chamada para sua API Django
      // const response = await api.post('/contas-pagar/', data);
      
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      alert("Conta cadastrada com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao cadastrar conta:", error);
      alert("Erro ao cadastrar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = () => {
    form.reset();
    form.clearErrors();
  };

  // Handlers para adicionar novos itens
  const handleFilialAdded = (data: any) => {
    const newFilial = {
      value: String(filiais.length + 1),
      label: data.nome.toUpperCase(),
    };
    setFiliais([...filiais, newFilial]);
    form.setValue("filial", newFilial.value);
  };

  const handleFornecedorAdded = (data: any) => {
    const newFornecedor = {
      value: String(fornecedores.length + 1),
      label: (data.nome_fantasia || data.nome).toUpperCase(),
    };
    setFornecedores([...fornecedores, newFornecedor]);
    form.setValue("fornecedor", newFornecedor.value);
  };

  const handleCategoriaAdded = (data: any) => {
    const newCategoria = {
      value: String(categorias.length + 1),
      label: data.nome.toUpperCase(),
    };
    setCategorias([...categorias, newCategoria]);
    form.setValue("categoria", newCategoria.value);
  };

  const handleFormaPagamentoAdded = (data: any) => {
    const newFormaPagamento = {
      value: String(formasPagamento.length + 1),
      label: data.nome.toUpperCase(),
    };
    setFormasPagamento([...formasPagamento, newFormaPagamento]);
    form.setValue("forma_pagamento", newFormaPagamento.value);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onReset={onReset}
          className="space-y-8 @container"
        >
          {/* Seção 1: Informações Básicas */}
          <div className="grid grid-cols-12 gap-4">
            {/* Filial */}
            <FormField
              control={form.control}
              name="filial"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-3 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">FILIAL *</FormLabel>
                  <div className="w-full">
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
                  </div>
                </FormItem>
              )}
            />

            {/* Fornecedor */}
            <FormField
              control={form.control}
              name="fornecedor"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-3 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">FORNECEDOR *</FormLabel>
                  <div className="w-full">
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
                  </div>
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-3 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">CATEGORIA *</FormLabel>
                  <div className="w-full">
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
                  </div>
                </FormItem>
              )}
            />

            {/* Tipo de Pagamento */}
            <FormField
              control={form.control}
              name="tipo_pagamento"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-3 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">TIPO PAGAMENTO *</FormLabel>
                  <div className="w-full">
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
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
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Seção 2: Descrição, Data e Valor */}
          <div className="grid grid-cols-12 gap-4">
            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-4 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">DESCRIÇÃO *</FormLabel>
                  <div className="w-full">
                    <FormControl>
                      <Input
                        placeholder="INFORME A DESCRIÇÃO DA CONTA"
                        type="text"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Data de Vencimento */}
            <FormField
              control={form.control}
              name="data_vencimento"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-4 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">DATA DE VENCIMENTO *</FormLabel>
                  <div className="w-full">
                    <FormControl>
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="dd/mm/yyyy"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Valor Original */}
            <FormField
              control={form.control}
              name="valor_original"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-4 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">VALOR ORIGINAL *</FormLabel>
                  <div className="w-full">
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="R$ 0,00"
                        icon={<BanknoteArrowDown className="size-4" strokeWidth={2} />}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Seção 3: Campos Condicionais (Parcelamento ou Recorrência) */}
          {tipoPagamento === "parcelado" && (
            <div className="grid grid-cols-12 gap-4">
              <FormField
                control={form.control}
                name="total_parcelas"
                render={({ field }) => (
                  <FormItem className="col-span-12 @5xl:col-span-4 flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">NÚMERO DE PARCELAS *</FormLabel>
                    <div className="w-full">
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
                    </div>
                  </FormItem>
                )}
              />
            </div>
          )}

          {tipoPagamento === "recorrente" && (
            <div className="grid grid-cols-12 gap-4">
              <FormField
                control={form.control}
                name="frequencia_recorrencia"
                render={({ field }) => (
                  <FormItem className="col-span-12 @5xl:col-span-4 flex self-end flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">FREQUÊNCIA *</FormLabel>
                    <div className="w-full">
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
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
                    </div>
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Seção 4: Detalhes Adicionais */}
          <div className="grid grid-cols-12 gap-4">
            {/* Forma de Pagamento */}
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-4 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">FORMA DE PAGAMENTO</FormLabel>
                  <div className="w-full">
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
                  </div>
                </FormItem>
              )}
            />

            {/* Notas Fiscais */}
            <FormField
              control={form.control}
              name="notas_fiscais"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-4 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">NOTAS FISCAIS</FormLabel>
                  <div className="w-full">
                    <FormControl>
                      <Input
                        placeholder="Ex: 123, 456, 789"
                        type="text"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Número do Boleto */}
            <FormField
              control={form.control}
              name="numero_boleto"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-4 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">NÚMERO DO BOLETO</FormLabel>
                  <div className="w-full">
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
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Seção 5: Observações e Anexo */}
          <div className="grid grid-cols-12 gap-4">
            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem className="col-span-12 @5xl:col-span-8 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">OBSERVAÇÕES</FormLabel>
                  <div className="w-full">
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais sobre esta conta..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Anexo */}
            <FormField
              control={form.control}
              name="anexo"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem className="col-span-12 @5xl:col-span-4 flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">ANEXO</FormLabel>
                  <div className="w-full">
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
                          <span className="text-sm text-gray-500">
                            {value?.name || "Clique para adicionar arquivo"}
                          </span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
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