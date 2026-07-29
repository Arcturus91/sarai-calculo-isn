import Link from "next/link";
import { notFound } from "next/navigation";

import { Boton, Encabezado } from "@/components/ui";
import { obtenerEmpresa } from "@/lib/datos/empresas";
import { desactivarEmpresaAccion } from "../acciones";
import { FormularioEditarEmpresa } from "../formularios";

export const dynamic = "force-dynamic";

export default async function PaginaEditarEmpresa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const empresa = await obtenerEmpresa(id);

  if (!empresa || !empresa.activa) {
    notFound();
  }

  return (
    <>
      <Link href="/empresas" className="text-sm text-tinta-suave underline underline-offset-4">
        ← Empresas
      </Link>

      <div className="mt-4">
        <Encabezado rotulo="Editar" titulo={empresa.razonSocial} />
      </div>

      <div className="max-w-xl space-y-8">
        <section className="border border-regla bg-panel p-6">
          <FormularioEditarEmpresa
            valores={{
              id: empresa.id,
              razonSocial: empresa.razonSocial,
              rfc: empresa.rfc,
              registroPatronal: empresa.registroPatronal,
            }}
          />
        </section>

        <section className="border border-regla bg-panel p-6">
          <h2 className="rotulo">Dar de baja</h2>
          <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
            La empresa deja de aparecer en la calculadora. Sus cálculos guardados se
            conservan y siguen siendo consultables en el histórico.
          </p>
          <form action={desactivarEmpresaAccion} className="mt-4">
            <input type="hidden" name="id" value={empresa.id} />
            <Boton type="submit" variante="peligro">
              Dar de baja
            </Boton>
          </form>
        </section>
      </div>
    </>
  );
}
