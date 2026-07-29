import type { Periodo } from "./tipos";

const ANIO_MINIMO = 2000;
const ANIO_MAXIMO = 2100;

/**
 * Día límite para presentar y pagar la declaración mensual.
 *
 * Art. 25 de la Ley de Hacienda para el Estado de Coahuila de Zaragoza: dentro
 * de los primeros diecisiete días naturales del mes siguiente.
 *
 * Pendiente por confirmar contra el Código Fiscal del Estado: si el día 17 cae
 * en día inhábil, el plazo podría recorrerse al siguiente día hábil. Mientras no
 * esté verificado documentalmente, se muestra el día 17 y la interfaz lo advierte.
 */
export const DIA_LIMITE_PAGO = 17;

const NOMBRES_MES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

function dosDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}

export function validarPeriodo(periodo: Periodo): void {
  const { anio, mes } = periodo;

  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error("El mes debe ser un número entero del 1 al 12.");
  }
  if (!Number.isInteger(anio) || anio < ANIO_MINIMO || anio > ANIO_MAXIMO) {
    throw new Error(`El año debe estar entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}.`);
  }
}

/** Primer día del periodo en formato ISO. Es la fecha con la que se compara la vigencia de la tasa. */
export function primerDiaDelPeriodo(periodo: Periodo): string {
  validarPeriodo(periodo);

  return `${periodo.anio}-${dosDigitos(periodo.mes)}-01`;
}

/** Fecha ISO límite de pago: día 17 del mes siguiente al periodo. */
export function fechaLimitePago(periodo: Periodo): string {
  validarPeriodo(periodo);

  const esDiciembre = periodo.mes === 12;
  const anio = esDiciembre ? periodo.anio + 1 : periodo.anio;
  const mes = esDiciembre ? 1 : periodo.mes + 1;

  return `${anio}-${dosDigitos(mes)}-${DIA_LIMITE_PAGO}`;
}

/** Etiqueta legible del periodo: "Julio 2026". */
export function etiquetaPeriodo(periodo: Periodo): string {
  validarPeriodo(periodo);

  return `${NOMBRES_MES[periodo.mes - 1]} ${periodo.anio}`;
}

/** Nombre del mes en español, para selectores y encabezados. */
export function nombreMes(mes: number): string {
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error("El mes debe ser un número entero del 1 al 12.");
  }

  return NOMBRES_MES[mes - 1];
}

/** Los doce meses, listos para poblar un selector. */
export const MESES = NOMBRES_MES.map((nombre, indice) => ({
  valor: indice + 1,
  nombre,
}));
