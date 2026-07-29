import { getDb, tasasIsn } from "@/lib/db";
import type { TasaISN } from "@/lib/isn";

/**
 * Trae el catálogo completo de tasas.
 *
 * Son un puñado de renglones —uno por reforma— así que se leen todos y la
 * selección por vigencia la hace el módulo de cálculo, que es donde está
 * probada esa regla.
 */
export async function leerTasas(): Promise<TasaISN[]> {
  const filas = await getDb().select().from(tasasIsn);

  return filas.map((fila) => ({
    tasa: fila.tasa,
    vigenteDesde: fila.vigenteDesde,
    vigenteHasta: fila.vigenteHasta,
    fundamento: fila.fundamento,
    fuenteUrl: fila.fuenteUrl,
    verificadaEn: fila.verificadaEn,
  }));
}
