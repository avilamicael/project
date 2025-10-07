"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { fornecedoresService } from "@/services/contas-pagar.service";

const fornecedorSchema = z.object({
  nome: z.string().min(1, "Nome/Razão Social é obrigatório"),
  nome_fantasia: z.string().optional(),
  tipo_pessoa: z.string(),
  cpf_cnpj: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2, "Estado deve ter 2 caracteres").optional(),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

interface FornecedorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: FornecedorFormData) => void;
}

export function FornecedorDialog({
  open,
  onOpenChange,
  onSuccess,
}: FornecedorDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: "",
      nome_fantasia: "",
      tipo_pessoa: "juridica",
      cpf_cnpj: "",
      email: "",
      telefone: "",
      cidade: "",
      estado: "",
    },
  });

  const tipoPessoa = form.watch("tipo_pessoa");

  const onSubmit = async (data: FornecedorFormData) => {
    setIsLoading(true);

    try {
      await fornecedoresService.criar({
        nome: data.nome,
        nome_fantasia: data.nome_fantasia || "",
        tipo_pessoa: data.tipo_pessoa as "fisica" | "juridica",
        cpf_cnpj: data.cpf_cnpj || "",
        inscricao_estadual: "",
        email: data.email || "",
        telefone: data.telefone || "",
        endereco: "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        cep: "",
        ativo: true,
        observacoes: ""
      });

      toast.success("Fornecedor criado com sucesso!");
      onSuccess(data);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao criar fornecedor", {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Fornecedor</DialogTitle>
          <DialogDescription>
            Cadastre um novo fornecedor para suas contas
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo_pessoa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pessoa *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fisica">Pessoa Física</SelectItem>
                      <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tipoPessoa === "fisica" ? "Nome Completo *" : "Razão Social *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        tipoPessoa === "fisica"
                          ? "João Silva"
                          : "Empresa LTDA"
                      }
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tipoPessoa === "juridica" && (
              <FormField
                control={form.control}
                name="nome_fantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome Fantasia"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="cpf_cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tipoPessoa === "fisica" ? "CPF" : "CNPJ"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        tipoPessoa === "fisica"
                          ? "000.000.000-00"
                          : "00.000.000/0000-00"
                      }
                      maxLength={tipoPessoa === "fisica" ? 11 : 14}
                      {...field}
                      disabled={isLoading}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cidade"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SC"
                        maxLength={2}
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}