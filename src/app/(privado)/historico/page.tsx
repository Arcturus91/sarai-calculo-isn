import Link from "next/link";

import { Encabezado } from "@/components/ui";
import { aniosConCalculos, listarCalculosDelAnio } from "@/lib/datos/calculos";
import { listarEmpresas } from "@/lib/datos/empresas";
import {
  fechaLegible,
  fechaLimitePago,
  formatearPesos,
  nombreMes,
  tasaComoPorcentaje,
} from "@/lib/isn";
import { SelectorHistorico } from "./selector";

export const dynamic = "force-dynamic";

export default async function PaginaHistorico({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string; anio?: string }>;
}) {
  const parametros = await searchParams;
  const empresas = await listarEmpresas();

  if (empresas.length === 0) {
    return (
      <>
        <Encabezado rotulo="Archivo" titulo="Histórico" />
        <p className="border border-regla bg-panel p-6 text-sm text-tinta-suave">
          Aún no hay empresas registradas, así que no hay cálculos que mostrar.{" "}
          <Link href="/empresas" className="text-sello underline underline-offset-4">
            Agrega la primera empresa
          </Link>
          .
        </p>
      </>
    );
  }

  const empresaElegida =
    empresas.find((empresa) => empresa.id === parametros.empresa) ?? empresas[0];

  const aniosGuardados = await aniosConCalculos(empresaElegida.id);
  const anios = aniosGuardados.length > 0 ? aniosGuardados : [new Date().getFullYear()];
  const anioPedido = Number(parametros.anio);
  const anio = anios.includes(anioPedido) ? anioPedido : anios[0];

  const calculos = await listarCalculosDelAnio(empresaElegida.id, anio);
  const totalBase = calculos.reduce((suma, fila) => suma + fila.baseGravableCentavos, 0);
  const totalImpuesto = calculos.reduce((suma, fila) => suma + fila.impuestoCentavos, 0);

  const parametrosExcel = new URLSearchParams({ empresa: empresaElegida.id, anio: String(anio) });

  return (
    <>
      <Encabezado rotulo="Archivo" titulo="Histórico" />

      <div className="mb-8 max-w-2xl">
        <SelectorHistorico
          empresas={empresas.map((empresa) => ({
            id: empresa.id,
            razonSocial: empresa.razonSocial,
            rfc: empresa.rfc,
          }))}
          empresaId={empresaElegida.id}
          anios={anios}
          anio={anio}
        />
      </div>

      {calculos.length === 0 ? (
        <p className="border border-regla bg-panel p-6 text-sm text-tinta-suave">
          No hay cálculos guardados de {empresaElegida.razonSocial} en {anio}.{" "}
          <Link href="/" className="text-sello underline underline-offset-4">
            Calcular un mes
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="overflow-x-auto border border-regla bg-panel">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-regla text-left">
                  <th className="rotulo px-5 py-3 font-normal">Periodo</th>
                  <th className="rotulo px-5 py-3 text-right font-normal">Base gravable</th>
                  <th className="rotulo px-5 py-3 text-right font-normal">Tasa</th>
                  <th className="rotulo px-5 py-3 text-right font-normal">Impuesto</th>
                  <th className="rotulo px-5 py-3 font-normal">Vence</th>
                  <th className="rotulo px-5 py-3 font-normal">
                    <span className="sr-only">Comprobante</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-regla">
                {calculos.map((fila) => (
                  <tr key={fila.id}>
                    <td className="px-5 py-3">{nombreMes(fila.mes)}</td>
                    <td className="cifra px-5 py-3 text-right">
                      {formatearPesos(fila.baseGravableCentavos)}
                    </td>
                    <td className="cifra px-5 py-3 text-right text-tinta-suave">
                      {tasaComoPorcentaje(fila.tasaAplicada)}
                    </td>
                    <td className="cifra px-5 py-3 text-right font-medium">
                      {formatearPesos(fila.impuestoCentavos)}
                    </td>
                    <td className="cifra px-5 py-3 text-xs text-tinta-suave">
                      {fechaLegible(fechaLimitePago({ anio: fila.anio, mes: fila.mes }))}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <a
                        href={`/api/exportar/pdf?calculo=${fila.id}`}
                        className="text-sello underline underline-offset-4"
                      >
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-regla">
                  <td className="px-5 py-3 font-medium">Total {anio}</td>
                  <td className="cifra px-5 py-3 text-right">{formatearPesos(totalBase)}</td>
                  <td />
                  <td className="cifra px-5 py-3 text-right font-medium">
                    {formatearPesos(totalImpuesto)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          <a
            href={`/api/exportar/excel?${parametrosExcel}`}
            className="mt-5 inline-flex rounded-[2px] border border-regla bg-panel px-4 py-2.5 text-sm font-medium transition-colors hover:border-tinta-suave"
          >
            Descargar el año en Excel
          </a>
        </>
      )}
    </>
  );
}
