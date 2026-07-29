"use client";

import { useRouter } from "next/navigation";

import { Campo, Seleccion } from "@/components/ui";
import type { EmpresaResumen } from "../calculadora";

export function SelectorHistorico({
  empresas,
  empresaId,
  anios,
  anio,
}: {
  empresas: EmpresaResumen[];
  empresaId: string;
  anios: number[];
  anio: number;
}) {
  const router = useRouter();

  function ir(cambios: { empresa?: string; anio?: number }) {
    const parametros = new URLSearchParams({
      empresa: cambios.empresa ?? empresaId,
      anio: String(cambios.anio ?? anio),
    });

    router.push(`/historico?${parametros}`);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Campo etiqueta="Empresa">
        <Seleccion
          value={empresaId}
          onChange={(evento) => ir({ empresa: evento.target.value })}
        >
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.razonSocial}
            </option>
          ))}
        </Seleccion>
      </Campo>

      <Campo etiqueta="Año">
        <Seleccion value={anio} onChange={(evento) => ir({ anio: Number(evento.target.value) })}>
          {anios.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </Seleccion>
      </Campo>
    </div>
  );
}
