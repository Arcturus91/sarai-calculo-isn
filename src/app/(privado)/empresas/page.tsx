import Link from "next/link";

import { Encabezado } from "@/components/ui";
import { listarEmpresas } from "@/lib/datos/empresas";
import { FormularioNuevaEmpresa } from "./formularios";

export const dynamic = "force-dynamic";

export default async function PaginaEmpresas() {
  const empresas = await listarEmpresas();

  return (
    <>
      <Encabezado rotulo="Catálogo" titulo="Empresas" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section>
          <h2 className="rotulo mb-3">Registradas</h2>

          {empresas.length === 0 ? (
            <p className="border border-regla bg-panel p-6 text-sm text-tinta-suave">
              Aún no registras ninguna razón social. Agrega la primera con el formulario de
              la derecha.
            </p>
          ) : (
            <ul className="divide-y divide-regla border border-regla bg-panel">
              {empresas.map((empresa) => (
                <li
                  key={empresa.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4"
                >
                  <div>
                    <p className="font-medium">{empresa.razonSocial}</p>
                    <p className="cifra text-xs text-tinta-suave">
                      {empresa.rfc}
                      {empresa.registroPatronal ? ` · ${empresa.registroPatronal}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/empresas/${empresa.id}`}
                    className="text-sm text-sello underline underline-offset-4"
                  >
                    Editar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="h-fit border border-regla bg-panel p-6">
          <h2 className="rotulo mb-4">Agregar empresa</h2>
          <FormularioNuevaEmpresa />
        </section>
      </div>
    </>
  );
}
