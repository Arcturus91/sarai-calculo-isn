import { and, asc, desc, eq, sql } from "drizzle-orm";

import { calculos, getDb, type CalculoFila } from "@/lib/db";
import type { Periodo, ResultadoISN } from "@/lib/isn";

export type CalculoGuardable = {
  empresaId: string;
  resultado: ResultadoISN;
  notas: string | null;
};

/**
 * Guarda el cálculo de un periodo, sobrescribiendo el anterior si ya existía.
 *
 * Se apoya en el índice único (empresa, año, mes): un periodo tiene un solo
 * cálculo vigente. Se copian tasa y fundamento tal como se aplicaron, para que
 * el histórico no cambie si mañana se reforma la tasa.
 */
export async function guardarCalculo(entrada: CalculoGuardable): Promise<CalculoFila> {
  const { empresaId, resultado, notas } = entrada;

  const valores = {
    empresaId,
    anio: resultado.periodo.anio,
    mes: resultado.periodo.mes,
    baseGravableCentavos: resultado.baseGravableCentavos,
    tasaAplicada: resultado.tasa,
    impuestoCentavos: resultado.impuestoCentavos,
    fundamento: resultado.fundamento,
    notas,
  };

  const [guardado] = await getDb()
    .insert(calculos)
    .values(valores)
    .onConflictDoUpdate({
      target: [calculos.empresaId, calculos.anio, calculos.mes],
      set: {
        baseGravableCentavos: valores.baseGravableCentavos,
        tasaAplicada: valores.tasaAplicada,
        impuestoCentavos: valores.impuestoCentavos,
        fundamento: valores.fundamento,
        notas: valores.notas,
        actualizadoEn: sql`now()`,
      },
    })
    .returning();

  return guardado;
}

export async function obtenerCalculo(
  empresaId: string,
  periodo: Periodo,
): Promise<CalculoFila | null> {
  const filas = await getDb()
    .select()
    .from(calculos)
    .where(
      and(
        eq(calculos.empresaId, empresaId),
        eq(calculos.anio, periodo.anio),
        eq(calculos.mes, periodo.mes),
      ),
    )
    .limit(1);

  return filas[0] ?? null;
}

export async function obtenerCalculoPorId(id: string): Promise<CalculoFila | null> {
  const filas = await getDb().select().from(calculos).where(eq(calculos.id, id)).limit(1);

  return filas[0] ?? null;
}

/** Cálculos de una empresa en un año, ordenados por mes. */
export async function listarCalculosDelAnio(
  empresaId: string,
  anio: number,
): Promise<CalculoFila[]> {
  return getDb()
    .select()
    .from(calculos)
    .where(and(eq(calculos.empresaId, empresaId), eq(calculos.anio, anio)))
    .orderBy(asc(calculos.mes));
}

/** Años en los que la empresa tiene cálculos, del más reciente al más antiguo. */
export async function aniosConCalculos(empresaId: string): Promise<number[]> {
  const filas = await getDb()
    .selectDistinct({ anio: calculos.anio })
    .from(calculos)
    .where(eq(calculos.empresaId, empresaId))
    .orderBy(desc(calculos.anio));

  return filas.map((fila) => fila.anio);
}
