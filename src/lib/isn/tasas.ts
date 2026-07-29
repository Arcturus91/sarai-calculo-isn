import { etiquetaPeriodo, primerDiaDelPeriodo } from "./periodo";
import type { Periodo, TasaISN } from "./tipos";

/** Escala con la que se opera la tasa como entero: 0.03 → 30 000 millonésimas. */
export const ESCALA_TASA = 1_000_000;

/**
 * Convierte la tasa de texto a millonésimas enteras.
 *
 * Se parsea la cadena en lugar de usar `parseFloat` para que "0.030000" dé
 * exactamente 30 000 y no 30 000.000000000004.
 */
export function tasaAMillonesimas(tasa: string): number {
  const partes = /^(\d+)(?:\.(\d{1,6}))?$/.exec(tasa.trim());
  if (!partes) {
    throw new Error(
      "La tasa no es válida. Debe ser una fracción decimal con hasta seis decimales, por ejemplo 0.030000",
    );
  }

  const decimales = (partes[2] ?? "").padEnd(6, "0");
  const millonesimas = Number(partes[1]) * ESCALA_TASA + Number(decimales);

  if (millonesimas > ESCALA_TASA) {
    throw new Error("La tasa no puede ser mayor a 1 (100%).");
  }

  return millonesimas;
}

/** Expresa la tasa como porcentaje legible: "0.030000" → "3%". */
export function tasaComoPorcentaje(tasa: string): string {
  const porcentaje = tasaAMillonesimas(tasa) / (ESCALA_TASA / 100);
  const texto = porcentaje.toFixed(4).replace(/\.?0+$/, "");

  return `${texto}%`;
}

/**
 * Elige la tasa aplicable a un periodo según su vigencia.
 *
 * La comparación se hace contra el primer día del periodo: las reformas al art.
 * 24 entran en vigor el 1° de enero, así que un periodo completo se rige por una
 * sola tasa. Si no hay ninguna vigente se lanza un error en lugar de devolver
 * cero: un impuesto de cero por falta de configuración sería un error silencioso
 * con consecuencias fiscales.
 */
export function seleccionarTasaVigente(
  tasas: readonly TasaISN[],
  periodo: Periodo,
): TasaISN {
  const dia = primerDiaDelPeriodo(periodo);

  const vigentes = tasas
    .filter(
      (tasa) =>
        tasa.vigenteDesde <= dia &&
        (tasa.vigenteHasta === null || tasa.vigenteHasta >= dia),
    )
    // Si varias empatan, gana la que entró en vigor más recientemente.
    .sort((a, b) => b.vigenteDesde.localeCompare(a.vigenteDesde));

  const elegida = vigentes[0];
  if (!elegida) {
    throw new Error(
      `No hay una tasa de ISN registrada para ${etiquetaPeriodo(periodo)}. ` +
        "Registra la tasa vigente de ese periodo antes de calcular.",
    );
  }

  return elegida;
}
