import { describe, expect, it } from "vitest";

import { calcularISN, calcularImpuestoCentavos } from "./calcular";
import type { TasaISN } from "./tipos";

const TASA_3: TasaISN = {
  tasa: "0.030000",
  vigenteDesde: "2024-01-01",
  vigenteHasta: null,
  fundamento: "Art. 24, Ley de Hacienda de Coahuila (Decreto 563)",
  fuenteUrl: "https://www.congresocoahuila.gob.mx/",
  verificadaEn: "2026-07-29",
};

describe("calcularImpuestoCentavos", () => {
  it("calcula el 3% de 100,000.00 pesos", () => {
    // 100,000.00 -> 10,000,000 centavos; 3% -> 3,000.00 -> 300,000 centavos
    expect(calcularImpuestoCentavos(10_000_000, "0.030000")).toBe(300_000);
  });

  it("devuelve cero cuando la base es cero", () => {
    expect(calcularImpuestoCentavos(0, "0.030000")).toBe(0);
  });

  it("redondea hacia arriba cuando la fracción es igual o mayor a medio centavo", () => {
    // 17 centavos * 3% = 0.51 centavos -> 1
    expect(calcularImpuestoCentavos(17, "0.030000")).toBe(1);
  });

  it("redondea hacia abajo cuando la fracción es menor a medio centavo", () => {
    // 16 centavos * 3% = 0.48 centavos -> 0
    expect(calcularImpuestoCentavos(16, "0.030000")).toBe(0);
  });

  it("redondea hacia arriba en el empate exacto de medio centavo", () => {
    // 50 centavos * 1% = 0.5 centavos -> 1
    expect(calcularImpuestoCentavos(50, "0.010000")).toBe(1);
  });

  it("conserva la precisión en montos que rebasan el entero seguro al multiplicar", () => {
    // 10 mil millones de pesos = 1e12 centavos. 1e12 * 30000 = 3e16 > Number.MAX_SAFE_INTEGER.
    expect(calcularImpuestoCentavos(1_000_000_000_000, "0.030000")).toBe(
      30_000_000_000,
    );
  });

  it("rechaza una base negativa", () => {
    expect(() => calcularImpuestoCentavos(-1, "0.030000")).toThrow(/negativa/i);
  });

  it("rechaza una base con decimales, porque debe venir en centavos enteros", () => {
    expect(() => calcularImpuestoCentavos(100.5, "0.030000")).toThrow(/entera/i);
  });
});

describe("calcularISN", () => {
  it("produce el cálculo completo de un mes", () => {
    const resultado = calcularISN({
      baseGravableCentavos: 25_000_000, // $250,000.00
      periodo: { anio: 2026, mes: 7 },
      tasas: [TASA_3],
    });

    expect(resultado.impuestoCentavos).toBe(750_000); // $7,500.00
    expect(resultado.tasa).toBe("0.030000");
    expect(resultado.tasaPorcentaje).toBe("3%");
    expect(resultado.fechaLimitePago).toBe("2026-08-17");
    expect(resultado.fundamento).toContain("Art. 24");
    expect(resultado.baseGravableCentavos).toBe(25_000_000);
  });

  it("calcula la fecha límite del periodo de diciembre en el año siguiente", () => {
    const resultado = calcularISN({
      baseGravableCentavos: 10_000_000,
      periodo: { anio: 2026, mes: 12 },
      tasas: [TASA_3],
    });

    expect(resultado.fechaLimitePago).toBe("2027-01-17");
  });

  it("falla cuando no hay tasa vigente en lugar de calcular cero en silencio", () => {
    expect(() =>
      calcularISN({
        baseGravableCentavos: 10_000_000,
        periodo: { anio: 2020, mes: 3 },
        tasas: [TASA_3],
      }),
    ).toThrow(/no hay una tasa/i);
  });

  it("falla cuando el periodo es inválido", () => {
    expect(() =>
      calcularISN({
        baseGravableCentavos: 10_000_000,
        periodo: { anio: 2026, mes: 13 },
        tasas: [TASA_3],
      }),
    ).toThrow(/mes/i);
  });

  it("falla cuando la base es negativa", () => {
    expect(() =>
      calcularISN({
        baseGravableCentavos: -100,
        periodo: { anio: 2026, mes: 7 },
        tasas: [TASA_3],
      }),
    ).toThrow(/negativa/i);
  });
});
