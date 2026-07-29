import Link from "next/link";

import { Encabezado } from "@/components/ui";
import { listarEmpresas } from "@/lib/datos/empresas";
import { leerTasas } from "@/lib/datos/tasas";
import type { Periodo } from "@/lib/isn";
import { Calculadora } from "./calculadora";

export const dynamic = "force-dynamic";

const PRIMER_ANIO = 2024;

/**
 * El periodo que se declara es el mes anterior, así que es el que se
 * preselecciona: en agosto se declara julio.
 */
function periodoAnterior(hoy: Date): Periodo {
  const mes = hoy.getMonth(); // 0-11, que ya es el mes anterior en base 1.

  return mes === 0
    ? { anio: hoy.getFullYear() - 1, mes: 12 }
    : { anio: hoy.getFullYear(), mes };
}

function aniosDisponibles(hasta: number): number[] {
  const anios: number[] = [];
  for (let anio = hasta; anio >= PRIMER_ANIO; anio -= 1) {
    anios.push(anio);
  }

  return anios;
}

export default async function PaginaCalculadora() {
  const [empresas, tasas] = await Promise.all([listarEmpresas(), leerTasas()]);
  const periodoInicial = periodoAnterior(new Date());

  return (
    <>
      <Encabezado rotulo="Declaración mensual" titulo="Calcular el ISN" />

      {empresas.length === 0 ? (
        <div className="border border-regla bg-panel p-8">
          <p className="text-tinta-suave">
            Aún no registras ninguna razón social. Agrega la primera para empezar a calcular.
          </p>
          <Link
            href="/empresas"
            className="mt-4 inline-flex rounded-[2px] bg-sello px-4 py-2.5 text-sm font-medium text-white"
          >
            Agregar empresa
          </Link>
        </div>
      ) : (
        <Calculadora
          empresas={empresas.map((empresa) => ({
            id: empresa.id,
            razonSocial: empresa.razonSocial,
            rfc: empresa.rfc,
          }))}
          tasas={tasas}
          anios={aniosDisponibles(Math.max(periodoInicial.anio + 1, PRIMER_ANIO))}
          periodoInicial={periodoInicial}
        />
      )}
    </>
  );
}
