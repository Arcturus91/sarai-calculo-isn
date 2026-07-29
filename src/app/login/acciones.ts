"use server";

import { redirect } from "next/navigation";

import { verificarContrasena } from "@/lib/auth/contrasena";
import { cerrarSesion, iniciarSesion } from "@/lib/auth/sesion";
import { rutaInternaSegura } from "@/lib/validacion";

export type EstadoLogin = { error?: string };

export async function entrar(
  _estadoPrevio: EstadoLogin,
  formulario: FormData,
): Promise<EstadoLogin> {
  const acceso = await verificarContrasena(String(formulario.get("contrasena") ?? ""));

  if (!acceso.ok) {
    return { error: acceso.mensaje };
  }

  await iniciarSesion();

  // `redirect` lanza para interrumpir la acción, así que va fuera de cualquier try.
  redirect(rutaInternaSegura(String(formulario.get("destino") ?? "")));
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/login");
}
