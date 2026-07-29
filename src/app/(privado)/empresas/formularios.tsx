"use client";

import { useActionState } from "react";

import { Aviso, Boton, Campo, Entrada } from "@/components/ui";
import {
  actualizarEmpresaAccion,
  crearEmpresaAccion,
  type EstadoEmpresa,
} from "./acciones";

type ValoresEmpresa = {
  id?: string;
  razonSocial?: string;
  rfc?: string;
  registroPatronal?: string | null;
};

function CamposEmpresa({ valores }: { valores: ValoresEmpresa }) {
  return (
    <>
      <Campo etiqueta="Razón social">
        <Entrada
          name="razonSocial"
          defaultValue={valores.razonSocial}
          placeholder="Servicios Integrales del Norte, S.A. de C.V."
          required
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="RFC">
          <Entrada
            name="rfc"
            defaultValue={valores.rfc}
            placeholder="ABC010203XY9"
            autoCapitalize="characters"
            className="cifra uppercase"
            required
          />
        </Campo>

        <Campo etiqueta="Registro patronal" ayuda="Opcional.">
          <Entrada
            name="registroPatronal"
            defaultValue={valores.registroPatronal ?? ""}
            className="cifra"
          />
        </Campo>
      </div>
    </>
  );
}

export function FormularioNuevaEmpresa() {
  const [estado, accion, enviando] = useActionState<EstadoEmpresa, FormData>(
    crearEmpresaAccion,
    {},
  );

  return (
    <form action={accion} className="space-y-5">
      <CamposEmpresa valores={{}} />

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <Boton type="submit" disabled={enviando}>
        {enviando ? "Guardando…" : "Agregar empresa"}
      </Boton>
    </form>
  );
}

export function FormularioEditarEmpresa({ valores }: { valores: ValoresEmpresa }) {
  const [estado, accion, enviando] = useActionState<EstadoEmpresa, FormData>(
    actualizarEmpresaAccion,
    {},
  );

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="id" value={valores.id} />
      <CamposEmpresa valores={valores} />

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}
      {estado.exito ? <Aviso tono="exito">{estado.exito}</Aviso> : null}

      <Boton type="submit" disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar cambios"}
      </Boton>
    </form>
  );
}
