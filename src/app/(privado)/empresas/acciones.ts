"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirSesion } from "@/lib/auth/guardia";
import { actualizarEmpresa, crearEmpresa, desactivarEmpresa } from "@/lib/datos/empresas";
import { esquemaEmpresa, normalizarEmpresa, primerError } from "@/lib/validacion";

export type EstadoEmpresa = { error?: string; exito?: string };

function refrescarPantallas() {
  revalidatePath("/empresas");
  revalidatePath("/");
  revalidatePath("/historico");
}

export async function crearEmpresaAccion(
  _estadoPrevio: EstadoEmpresa,
  formulario: FormData,
): Promise<EstadoEmpresa> {
  await exigirSesion();

  const validado = esquemaEmpresa.safeParse(normalizarEmpresa(formulario));
  if (!validado.success) {
    return { error: primerError(validado.error) };
  }

  await crearEmpresa(validado.data);
  refrescarPantallas();

  return { exito: `${validado.data.razonSocial} quedó registrada.` };
}

export async function actualizarEmpresaAccion(
  _estadoPrevio: EstadoEmpresa,
  formulario: FormData,
): Promise<EstadoEmpresa> {
  await exigirSesion();

  const id = String(formulario.get("id") ?? "");
  if (id === "") {
    return { error: "No se identificó la empresa que se quiere editar." };
  }

  const validado = esquemaEmpresa.safeParse(normalizarEmpresa(formulario));
  if (!validado.success) {
    return { error: primerError(validado.error) };
  }

  await actualizarEmpresa(id, validado.data);
  refrescarPantallas();

  return { exito: "Cambios guardados." };
}

export async function desactivarEmpresaAccion(formulario: FormData): Promise<void> {
  await exigirSesion();

  await desactivarEmpresa(String(formulario.get("id") ?? ""));
  refrescarPantallas();

  redirect("/empresas");
}
