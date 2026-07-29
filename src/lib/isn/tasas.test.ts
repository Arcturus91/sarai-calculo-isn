import { describe, expect, it } from "vitest";

import type { TasaISN } from "./tipos";
import { seleccionarTasaVigente, tasaAMillonesimas, tasaComoPorcentaje } from "./tasas";

const TASA_2_POR_CIENTO: TasaISN = {
  tasa: "0.020000",
  vigenteDesde: "2010-01-01",
  vigenteHasta: "2023-12-31",
  fundamento: "Art. 24, Ley de Hacienda de Coahuila (texto anterior)",
  fuenteUrl: "https://www.congresocoahuila.gob.mx/",
  verificadaEn: "2026-07-29",
};

const TASA_3_POR_CIENTO: TasaISN = {
  tasa: "0.030000",
  vigenteDesde: "2024-01-01",
  vigenteHasta: null,
  fundamento: "Art. 24, Ley de Hacienda de Coahuila (Decreto 563)",
  fuenteUrl: "https://www.congresocoahuila.gob.mx/",
  verificadaEn: "2026-07-29",
};

const CATALOGO = [TASA_2_POR_CIENTO, TASA_3_POR_CIENTO];

describe("tasaAMillonesimas", () => {
  it("convierte 3% a millonésimas sin error de punto flotante", () => {
    expect(tasaAMillonesimas("0.030000")).toBe(30_000);
  });

  it("convierte 2%", () => {
    expect(tasaAMillonesimas("0.020000")).toBe(20_000);
  });

  it("acepta una tasa escrita sin ceros de relleno", () => {
    expect(tasaAMillonesimas("0.03")).toBe(30_000);
  });

  it("acepta una tasa con fracción de punto porcentual", () => {
    // 2.5%
    expect(tasaAMillonesimas("0.025")).toBe(25_000);
  });

  it("acepta cero", () => {
    expect(tasaAMillonesimas("0")).toBe(0);
  });

  it("rechaza una tasa negativa", () => {
    expect(() => tasaAMillonesimas("-0.03")).toThrow(/tasa/i);
  });

  it("rechaza una tasa mayor a uno", () => {
    expect(() => tasaAMillonesimas("1.5")).toThrow(/tasa/i);
  });

  it("rechaza texto inválido", () => {
    expect(() => tasaAMillonesimas("tres por ciento")).toThrow(/tasa/i);
  });
});

describe("tasaComoPorcentaje", () => {
  it("expresa la fracción como porcentaje legible", () => {
    expect(tasaComoPorcentaje("0.030000")).toBe("3%");
  });

  it("conserva los decimales significativos", () => {
    expect(tasaComoPorcentaje("0.025000")).toBe("2.5%");
  });
});

describe("seleccionarTasaVigente", () => {
  it("elige la tasa del 3% para un periodo de 2026", () => {
    const tasa = seleccionarTasaVigente(CATALOGO, { anio: 2026, mes: 7 });
    expect(tasa.tasa).toBe("0.030000");
  });

  it("elige la tasa del 3% para enero de 2024, el mes en que entró en vigor", () => {
    const tasa = seleccionarTasaVigente(CATALOGO, { anio: 2024, mes: 1 });
    expect(tasa.tasa).toBe("0.030000");
  });

  it("no aplica retroactivamente: un periodo de 2023 usa la tasa anterior", () => {
    const tasa = seleccionarTasaVigente(CATALOGO, { anio: 2023, mes: 12 });
    expect(tasa.tasa).toBe("0.020000");
  });

  it("falla de forma explícita cuando no hay tasa para el periodo", () => {
    const tasa = seleccionarTasaVigente(
      [TASA_3_POR_CIENTO],
      { anio: 2026, mes: 1 },
    );
    expect(tasa.tasa).toBe("0.030000");

    expect(() =>
      seleccionarTasaVigente([TASA_3_POR_CIENTO], { anio: 2020, mes: 1 }),
    ).toThrow(/no hay una tasa/i);
  });

  it("falla cuando el catálogo está vacío en lugar de asumir cero", () => {
    expect(() => seleccionarTasaVigente([], { anio: 2026, mes: 7 })).toThrow(
      /no hay una tasa/i,
    );
  });

  it("elige la vigencia más reciente cuando varias empatan", () => {
    const anterior: TasaISN = { ...TASA_3_POR_CIENTO, tasa: "0.030000" };
    const nueva: TasaISN = {
      ...TASA_3_POR_CIENTO,
      tasa: "0.035000",
      vigenteDesde: "2026-01-01",
    };
    const tasa = seleccionarTasaVigente([anterior, nueva], { anio: 2026, mes: 7 });
    expect(tasa.tasa).toBe("0.035000");
  });
});
