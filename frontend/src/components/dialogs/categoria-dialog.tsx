"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { categoriasService } from "@/services/contas-pagar.service";
import * as z from "zod";
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

const categoriaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string(),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida").optional(),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface CategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: CategoriaFormData) => void;
  tipoFixo?: "receita" | "despesa"; // Para filtrar apenas despesas no form de contas a pagar
}

export function CategoriaDialog({
  open,
  onOpenChange,
  onSuccess,
  tipoFixo,
}: CategoriaDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: "",
      tipo: tipoFixo || "despesa",
      cor: "#6B7280",
    },
  });

  const onSubmit = async (data: CategoriaFormData) => {
    setIsLoading(true);

    try {
      await categoriasService.criar({
        nome: data.nome,
        tipo: data.tipo as "receita" | "despesa",
        cor: data.cor || "#6B7280",
        ativa: true
      });
      
      onSuccess(data);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Erro ao criar categoria:", error);
      alert(error.response?.data?.message || error.message || "Erro ao salvar categoria");
    } finally {
      setIsLoading(false);
    }
  };

  const coresPredefinidas = [
    { value: "#EF4444", label: "Vermelho" },
    { value: "#F59E0B", label: "Laranja" },
    { value: "#10B981", label: "Verde" },
    { value: "#3B82F6", label: "Azul" },
    { value: "#8B5CF6", label: "Roxo" },
    { value: "#EC4899", label: "Rosa" },
    { value: "#6B7280", label: "Cinza" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Cadastre uma nova categoria financeira
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Energia Elétrica, Aluguel, etc."
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
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || !!tipoFixo}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {coresPredefinidas.map((cor) => (
                        <button
                          key={cor.value}
                          type="button"
                          className={`w-10 h-10 rounded-md border-2 transition-all ${field.value === cor.value
                              ? "border-primary scale-110"
                              : "border-transparent hover:scale-105"
                            }`}
                          style={{ backgroundColor: cor.value }}
                          onClick={() => field.onChange(cor.value)}
                          disabled={isLoading}
                          title={cor.label}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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