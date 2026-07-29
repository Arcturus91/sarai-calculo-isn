"use server";

import { redirect } from "next/navigation";

import { verificarContrasena } from "@/lib/auth/contrasena";
import {
  LIMITE,
  limpiarIntentos,
  origenDeLaPeticion,
  registrarFallo,
  revisarIntentos,
} from "@/lib/auth/intentos";
import { cerrarSesion, iniciarSesion } from "@/lib/auth/sesion";
import { rutaInternaSegura } from "@/lib/validacion";

export type EstadoLogin = { error?: string };

export async function entrar(
  _estadoPrevio: EstadoLogin,
  formulario: FormData,
): Promise<EstadoLogin> {
  const origen = await origenDeLaPeticion();

  const intentos = await revisarIntentos(origen);
  if (intentos.bloqueado) {
    return {
      error: `Demasiados intentos fallidos. Espera ${LIMITE.VENTANA_MINUTOS} minutos e inténtalo de nuevo.`,
    };
  }

  const acceso = await verificarContrasena(String(formulario.get("contrasena") ?? ""));

  if (!acceso.ok) {
    await registrarFallo(origen);
    return { error: acceso.mensaje };
  }

  await limpiarIntentos(origen);
  await iniciarSesion();

  // `redirect` lanza para interrumpir la acción, así que va fuera de cualquier try.
  redirect(rutaInternaSegura(String(formulario.get("destino") ?? "")));
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/login");
}
