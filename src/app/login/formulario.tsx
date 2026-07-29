"use client";

import { useActionState } from "react";

import { Aviso, Boton, Campo, Entrada } from "@/components/ui";
import { entrar, type EstadoLogin } from "./acciones";

export function FormularioLogin({ destino }: { destino: string }) {
  const [estado, accion, enviando] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="destino" value={destino} />

      <Campo etiqueta="Contraseña">
        <Entrada
          type="password"
          name="contrasena"
          autoComplete="current-password"
          autoFocus
          required
        />
      </Campo>

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <Boton type="submit" disabled={enviando} className="w-full">
        {enviando ? "Entrando…" : "Entrar"}
      </Boton>
    </form>
  );
}
