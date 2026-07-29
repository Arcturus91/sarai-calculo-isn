import { redirect } from "next/navigation";

import { haySesion } from "./sesion";

/**
 * Se llama al inicio de cada acción de servidor.
 *
 * `proxy.ts` ya bloquea la navegación, pero las acciones son endpoints por
 * derecho propio: se verifican aparte para no depender de una sola capa.
 */
export async function exigirSesion(): Promise<void> {
  if (!(await haySesion())) {
    redirect("/login");
  }
}
