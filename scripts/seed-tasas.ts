/**
 * Siembra el catálogo de tasas del ISN de Coahuila.
 *
 * Es idempotente: se puede correr las veces que haga falta sin duplicar
 * renglones. Correr con `npm run db:seed`.
 */
import { eq } from "drizzle-orm";

import { getDb, tasasIsn } from "../src/lib/db";

const TASAS_INICIALES = [
  {
    tasa: "0.030000",
    vigenteDesde: "2024-01-01",
    vigenteHasta: null,
    fundamento:
      "Art. 24, Ley de Hacienda para el Estado de Coahuila de Zaragoza (reformado por el Decreto 563)",
    fuenteUrl: "https://www.congresocoahuila.gob.mx/transparencia/03/Leyes_Coahuila/coa25.pdf",
    verificadaEn: "2026-07-29",
  },
] as const;

async function sembrar() {
  const db = getDb();

  for (const tasa of TASAS_INICIALES) {
    const existentes = await db
      .select({ id: tasasIsn.id })
      .from(tasasIsn)
      .where(eq(tasasIsn.vigenteDesde, tasa.vigenteDesde));

    if (existentes.length > 0) {
      console.log(`· Tasa vigente desde ${tasa.vigenteDesde}: ya existía, sin cambios.`);
      continue;
    }

    await db.insert(tasasIsn).values(tasa);
    console.log(`✓ Tasa ${tasa.tasa} vigente desde ${tasa.vigenteDesde}: insertada.`);
  }
}

sembrar()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("No se pudo sembrar el catálogo de tasas:", error);
    process.exit(1);
  });
