import ContasPagarForm from "@/components/forms/contas-pagar-form";

export default function ContasPagarPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cadastrar Conta a Pagar</h1>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <ContasPagarForm />
      </div>
    </div>
  );
}
