"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { filiaisService } from "@/services/contas-pagar.service";
import { toast } from "sonner";

const filialSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2, "Estado deve ter 2 caracteres").optional(),
  telefone: z.string().optional(),
});

type FilialFormData = z.infer<typeof filialSchema>;

interface FilialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: any) => void;
}

export function FilialDialog({
  open,
  onOpenChange,
  onSuccess,
}: FilialDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FilialFormData>({
    resolver: zodResolver(filialSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      cidade: "",
      estado: "",
      telefone: "",
    },
  });

  const onSubmit = async (data: FilialFormData) => {
    setIsLoading(true);

    try {
      const novaFilial = await filiaisService.criar({
        nome: data.nome,
        cnpj: data.cnpj || "",
        endereco: "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        telefone: data.telefone || "",
        email: "",
        ativa: true
      });

      toast.success("Filial criada com sucesso!");
      onSuccess(novaFilial);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Erro ao criar filial:", error);
      toast.error("Erro ao criar filial", {
        description: error.response?.data?.message || error.message || "Erro ao salvar filial"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Filial</DialogTitle>
          <DialogDescription>
            Cadastre uma nova filial para sua empresa
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
                      placeholder="Nome da filial"
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
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000000000000"
                      maxLength={14}
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