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
import { Loader2 } from "lucide-react";
import { formasPagamentoService } from "@/services/contas-pagar.service";

const formaPagamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

type FormaPagamentoFormData = z.infer<typeof formaPagamentoSchema>;

interface FormaPagamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: FormaPagamentoFormData) => void;
}

export function FormaPagamentoDialog({
  open,
  onOpenChange,
  onSuccess,
}: FormaPagamentoDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormaPagamentoFormData>({
    resolver: zodResolver(formaPagamentoSchema),
    defaultValues: {
      nome: "",
    },
  });

  const onSubmit = async (data: FormaPagamentoFormData) => {
    setIsLoading(true);

    try {
      await formasPagamentoService.criar({
        nome: data.nome,
        ativa: true
      });

      toast.success("Forma de pagamento criada com sucesso!");
      onSuccess(data);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao criar forma de pagamento", {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nova Forma de Pagamento</DialogTitle>
          <DialogDescription>
            Cadastre uma nova forma de pagamento
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
                      placeholder="Ex: Dinheiro, PIX, Cartão, etc."
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