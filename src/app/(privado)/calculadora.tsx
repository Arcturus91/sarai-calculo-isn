"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { AreaTexto, Aviso, Boton, Campo, Entrada, Seleccion } from "@/components/ui";
import {
  calcularISN,
  centavosDesdeTexto,
  fechaLegible,
  formatearPesos,
  MESES,
  type Periodo,
  type ResultadoISN,
  type TasaISN,
} from "@/lib/isn";
import { guardarCalculoAccion, type EstadoCalculo } from "./acciones";

export type EmpresaResumen = {
  id: string;
  razonSocial: string;
  rfc: string;
};

type Vista =
  | { tipo: "vacio" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; resultado: ResultadoISN };

/** Calcula en vivo mientras se escribe; los errores se muestran, no se lanzan. */
function calcularVista(base: string, periodo: Periodo, tasas: TasaISN[]): Vista {
  if (base.trim() === "") {
    return { tipo: "vacio" };
  }

  try {
    return {
      tipo: "listo",
      resultado: calcularISN({
        baseGravableCentavos: centavosDesdeTexto(base),
        periodo,
        tasas,
      }),
    };
  } catch (error) {
    return {
      tipo: "error",
      mensaje: error instanceof Error ? error.message : "No se pudo calcular.",
    };
  }
}

export function Calculadora({
  empresas,
  tasas,
  anios,
  periodoInicial,
}: {
  empresas: EmpresaResumen[];
  tasas: TasaISN[];
  anios: number[];
  periodoInicial: Periodo;
}) {
  const [empresaId, setEmpresaId] = useState(empresas[0]?.id ?? "");
  const [anio, setAnio] = useState(periodoInicial.anio);
  const [mes, setMes] = useState(periodoInicial.mes);
  const [base, setBase] = useState("");
  const [notas, setNotas] = useState("");

  const [estado, accion, guardando] = useActionState<EstadoCalculo, FormData>(
    guardarCalculoAccion,
    { estado: "inicial" },
  );

  const vista = useMemo(
    () => calcularVista(base, { anio, mes }, tasas),
    [base, anio, mes, tasas],
  );

  return (
    <form action={accion} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="space-y-5">
        <Campo etiqueta="Empresa">
          <Seleccion
            name="empresaId"
            value={empresaId}
            onChange={(evento) => setEmpresaId(evento.target.value)}
            required
          >
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.razonSocial} — {empresa.rfc}
              </option>
            ))}
          </Seleccion>
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo etiqueta="Mes">
            <Seleccion
              name="mes"
              value={mes}
              onChange={(evento) => setMes(Number(evento.target.value))}
            >
              {MESES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.nombre}
                </option>
              ))}
            </Seleccion>
          </Campo>

          <Campo etiqueta="Año">
            <Seleccion
              name="anio"
              value={anio}
              onChange={(evento) => setAnio(Number(evento.target.value))}
            >
              {anios.map((valor) => (
                <option key={valor} value={valor}>
                  {valor}
                </option>
              ))}
            </Seleccion>
          </Campo>
        </div>

        <Campo
          etiqueta="Base gravable del mes"
          ayuda="Total de erogaciones gravadas por servicios personales subordinados, ya sin los conceptos exentos del art. 32."
        >
          <Entrada
            name="base"
            value={base}
            onChange={(evento) => setBase(evento.target.value)}
            inputMode="decimal"
            autoComplete="off"
            placeholder="250000.00"
            className="cifra text-lg"
            required
          />
        </Campo>

        <Campo etiqueta="Notas" ayuda="Opcional. Queda guardada junto al cálculo.">
          <AreaTexto
            name="notas"
            value={notas}
            onChange={(evento) => setNotas(evento.target.value)}
            rows={3}
          />
        </Campo>

        {estado.estado === "error" ? <Aviso tono="error">{estado.mensaje}</Aviso> : null}

        {estado.estado === "confirmar" ? (
          <div className="space-y-3">
            <Aviso tono="error">{estado.mensaje}</Aviso>
            <Boton type="submit" name="confirmado" value="si" variante="peligro" disabled={guardando}>
              Reemplazar el cálculo guardado
            </Boton>
          </div>
        ) : null}

        {estado.estado === "guardado" ? (
          <div className="space-y-3">
            <Aviso tono="exito">{estado.mensaje}</Aviso>
            <Link href="/historico" className="text-sm text-sello underline underline-offset-4">
              Ver el histórico
            </Link>
          </div>
        ) : null}

        {estado.estado !== "confirmar" ? (
          <Boton type="submit" disabled={guardando || vista.tipo !== "listo"}>
            {guardando ? "Guardando…" : "Guardar cálculo"}
          </Boton>
        ) : null}
      </section>

      <Comprobante vista={vista} />
    </form>
  );
}

/**
 * El comprobante: la copia al carbón del cálculo.
 *
 * Es lo único de la pantalla que lleva adorno —el borde perforado— porque es el
 * resultado que la usuaria viene a buscar.
 */
function Comprobante({ vista }: { vista: Vista }) {
  return (
    <aside className="relative h-fit border border-regla bg-panel p-6 lg:sticky lg:top-6">
      <span className="perforado absolute inset-y-0 left-0 w-1.5" aria-hidden="true" />

      <p className="rotulo">Impuesto a pagar</p>

      {vista.tipo === "listo" ? (
        <>
          <p className="cifra mt-2 text-4xl leading-none tracking-tight">
            {formatearPesos(vista.resultado.impuestoCentavos)}
          </p>

          <dl className="mt-6 space-y-3 border-t border-regla pt-5 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-tinta-suave">Base gravable</dt>
              <dd className="cifra">{formatearPesos(vista.resultado.baseGravableCentavos)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-tinta-suave">Tasa aplicada</dt>
              <dd className="cifra rounded-[2px] bg-sello-tenue px-2 py-0.5 text-sello">
                {vista.resultado.tasaPorcentaje}
              </dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-regla pt-5">
            <p className="rotulo">Fecha límite de pago</p>
            <p className="cifra mt-1 text-copia">
              {fechaLegible(vista.resultado.fechaLimitePago)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-tinta-suave">
              Art. 25: dentro de los primeros 17 días naturales del mes siguiente. Si el 17
              cae en día inhábil, confirma con tu contador si el plazo se recorre.
            </p>
          </div>

          <p className="mt-5 border-t border-regla pt-5 font-serif text-xs italic leading-relaxed text-tinta-suave">
            {vista.resultado.fundamento}
          </p>
        </>
      ) : (
        <>
          <p className="cifra mt-2 text-4xl leading-none tracking-tight text-tinta-tenue">
            $0.00
          </p>
          <p className="mt-6 border-t border-regla pt-5 text-sm text-tinta-suave">
            {vista.tipo === "error"
              ? vista.mensaje
              : "Captura la base gravable del mes para ver el cálculo."}
          </p>
        </>
      )}
    </aside>
  );
}
