import { FormularioLogin } from "./formulario";

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}) {
  const { destino } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="rotulo">Coahuila de Zaragoza</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Impuesto Sobre Nóminas
          </h1>
          <p className="mt-2 text-sm text-tinta-suave">
            Cálculo mensual y archivo de declaraciones.
          </p>
        </div>

        <div className="rounded-[2px] border border-regla bg-panel p-6">
          <FormularioLogin destino={destino ?? "/"} />
        </div>
      </div>
    </main>
  );
}
