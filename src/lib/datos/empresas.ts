import { asc, eq } from "drizzle-orm";

import { empresas, getDb, type EmpresaFila } from "@/lib/db";

export type DatosEmpresa = {
  razonSocial: string;
  rfc: string;
  registroPatronal: string | null;
};

export async function listarEmpresas(): Promise<EmpresaFila[]> {
  return getDb()
    .select()
    .from(empresas)
    .where(eq(empresas.activa, true))
    .orderBy(asc(empresas.razonSocial));
}

export async function obtenerEmpresa(id: string): Promise<EmpresaFila | null> {
  const filas = await getDb().select().from(empresas).where(eq(empresas.id, id)).limit(1);

  return filas[0] ?? null;
}

export async function crearEmpresa(datos: DatosEmpresa): Promise<EmpresaFila> {
  const [creada] = await getDb().insert(empresas).values(datos).returning();

  return creada;
}

export async function actualizarEmpresa(id: string, datos: DatosEmpresa): Promise<void> {
  await getDb().update(empresas).set(datos).where(eq(empresas.id, id));
}

/**
 * Baja lógica.
 *
 * Nunca se borra: los cálculos guardados apuntan a la empresa y el histórico
 * fiscal debe seguir siendo consultable.
 */
export async function desactivarEmpresa(id: string): Promise<void> {
  await getDb().update(empresas).set({ activa: false }).where(eq(empresas.id, id));
}
