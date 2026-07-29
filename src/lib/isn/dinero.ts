/**
 * Manejo de dinero en centavos enteros.
 *
 * El dinero nunca se representa con punto flotante: `0.1 + 0.2 !== 0.3` y en un
 * cálculo de impuestos esa diferencia se convierte en un peso mal declarado.
 * Todo entra y sale de aquí como enteros de centavos.
 */

/** Convierte lo que escribe la usuaria ("$1,234.56") a centavos enteros. */
export function centavosDesdeTexto(entrada: string): number {
  const limpio = entrada.trim().replace(/[$\s]/g, "").replace(/,/g, "");

  if (limpio === "") {
    throw new Error("Escribe un monto.");
  }
  if (limpio.startsWith("-")) {
    throw new Error("El monto no puede ser negativo.");
  }

  const partes = /^(\d+)(?:\.(\d+))?$/.exec(limpio);
  if (!partes) {
    throw new Error("El monto no es válido. Escribe solo números, por ejemplo 125000.50");
  }

  const decimales = partes[2] ?? "";
  if (decimales.length > 2) {
    throw new Error("El monto solo puede tener dos decimales.");
  }

  // BigInt evita perder centavos en montos grandes.
  const centavos = BigInt(partes[1]) * 100n + BigInt(decimales.padEnd(2, "0"));
  if (centavos > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("El monto es demasiado grande.");
  }

  return Number(centavos);
}

/** Convierte centavos a una cadena de pesos sin separadores: 123456 → "1234.56". */
export function pesosDesdeCentavos(centavos: number): string {
  const esNegativo = centavos < 0;
  const absolutos = Math.abs(Math.trunc(centavos));
  const enteros = Math.floor(absolutos / 100);
  const fraccion = absolutos % 100;

  return `${esNegativo ? "-" : ""}${enteros}.${String(fraccion).padStart(2, "0")}`;
}

/**
 * Da formato de moneda para mostrar en pantalla: 123456789 → "$1,234,567.89".
 *
 * Se construye a mano en lugar de usar `Intl` para que el resultado no dependa
 * de la versión de ICU del entorno y sea idéntico en local, en Vercel y en el PDF.
 */
export function formatearPesos(centavos: number): string {
  const [enteros, decimales] = pesosDesdeCentavos(centavos).replace("-", "").split(".");
  const conSeparadores = enteros.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${centavos < 0 ? "-" : ""}$${conSeparadores}.${decimales}`;
}
