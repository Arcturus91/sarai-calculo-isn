import { fechaLimitePago, validarPeriodo } from "./periodo";
import { ESCALA_TASA, seleccionarTasaVigente, tasaAMillonesimas, tasaComoPorcentaje } from "./tasas";
import type { Periodo, ResultadoISN, TasaISN } from "./tipos";

/**
 * Aplica la tasa a la base gravable, con redondeo al centavo más próximo.
 *
 * Toda la aritmética se hace en `BigInt` porque `base × tasa` rebasa el entero
 * seguro de JavaScript en nóminas grandes, y ahí un redondeo mal hecho deja de
 * ser un detalle: es dinero declarado de más o de menos.
 */
export function calcularImpuestoCentavos(baseCentavos: number, tasa: string): number {
  if (!Number.isFinite(baseCentavos)) {
    throw new Error("La base gravable no es un número válido.");
  }
  if (baseCentavos < 0) {
    throw new Error("La base gravable no puede ser negativa.");
  }
  if (!Number.isInteger(baseCentavos)) {
    throw new Error("La base gravable debe ser una cantidad entera de centavos.");
  }

  const escala = BigInt(ESCALA_TASA);
  const producto = BigInt(baseCentavos) * BigInt(tasaAMillonesimas(tasa));
  const cociente = producto / escala;
  const residuo = producto % escala;

  // Redondeo al centavo más próximo; el empate exacto sube.
  const centavos = residuo * 2n >= escala ? cociente + 1n : cociente;

  return Number(centavos);
}

export type EntradaCalculoISN = {
  baseGravableCentavos: number;
  periodo: Periodo;
  tasas: readonly TasaISN[];
};

/**
 * Cálculo completo del ISN de un periodo.
 *
 * Devuelve también el fundamento y la fuente porque el resultado se guarda y se
 * imprime: quien lo consulte dentro de dos años debe poder ver con qué tasa y
 * con qué sustento legal se calculó.
 */
export function calcularISN(entrada: EntradaCalculoISN): ResultadoISN {
  const { baseGravableCentavos, periodo, tasas } = entrada;

  validarPeriodo(periodo);
  const tasaVigente = seleccionarTasaVigente(tasas, periodo);

  return {
    periodo,
    baseGravableCentavos,
    tasa: tasaVigente.tasa,
    tasaPorcentaje: tasaComoPorcentaje(tasaVigente.tasa),
    impuestoCentavos: calcularImpuestoCentavos(baseGravableCentavos, tasaVigente.tasa),
    fundamento: tasaVigente.fundamento,
    fuenteUrl: tasaVigente.fuenteUrl,
    fechaLimitePago: fechaLimitePago(periodo),
  };
}
