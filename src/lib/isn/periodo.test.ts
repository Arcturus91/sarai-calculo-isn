import { describe, expect, it } from "vitest";

import {
  etiquetaPeriodo,
  fechaLimitePago,
  primerDiaDelPeriodo,
  validarPeriodo,
} from "./periodo";

describe("validarPeriodo", () => {
  it("acepta un periodo válido", () => {
    expect(() => validarPeriodo({ anio: 2026, mes: 7 })).not.toThrow();
  });

  it("acepta los extremos del año", () => {
    expect(() => validarPeriodo({ anio: 2026, mes: 1 })).not.toThrow();
    expect(() => validarPeriodo({ anio: 2026, mes: 12 })).not.toThrow();
  });

  it("rechaza el mes cero", () => {
    expect(() => validarPeriodo({ anio: 2026, mes: 0 })).toThrow(/mes/i);
  });

  it("rechaza el mes trece", () => {
    expect(() => validarPeriodo({ anio: 2026, mes: 13 })).toThrow(/mes/i);
  });

  it("rechaza un mes con decimales", () => {
    expect(() => validarPeriodo({ anio: 2026, mes: 7.5 })).toThrow(/mes/i);
  });

  it("rechaza un año fuera de rango", () => {
    expect(() => validarPeriodo({ anio: 1999, mes: 1 })).toThrow(/año/i);
    expect(() => validarPeriodo({ anio: 2101, mes: 1 })).toThrow(/año/i);
  });
});

describe("primerDiaDelPeriodo", () => {
  it("devuelve el primer día en formato ISO", () => {
    expect(primerDiaDelPeriodo({ anio: 2026, mes: 7 })).toBe("2026-07-01");
  });

  it("rellena el mes con cero a la izquierda", () => {
    expect(primerDiaDelPeriodo({ anio: 2026, mes: 1 })).toBe("2026-01-01");
  });
});

describe("fechaLimitePago", () => {
  it("es el día 17 del mes siguiente", () => {
    // Art. 25 de la Ley de Hacienda de Coahuila: 17 días naturales.
    expect(fechaLimitePago({ anio: 2026, mes: 7 })).toBe("2026-08-17");
  });

  it("cruza al año siguiente cuando el periodo es diciembre", () => {
    expect(fechaLimitePago({ anio: 2026, mes: 12 })).toBe("2027-01-17");
  });

  it("rellena el mes con cero a la izquierda", () => {
    expect(fechaLimitePago({ anio: 2026, mes: 1 })).toBe("2026-02-17");
  });

  it("rechaza un periodo inválido", () => {
    expect(() => fechaLimitePago({ anio: 2026, mes: 13 })).toThrow(/mes/i);
  });
});

describe("etiquetaPeriodo", () => {
  it("escribe el mes en español", () => {
    expect(etiquetaPeriodo({ anio: 2026, mes: 7 })).toBe("Julio 2026");
  });

  it("escribe diciembre correctamente", () => {
    expect(etiquetaPeriodo({ anio: 2026, mes: 12 })).toBe("Diciembre 2026");
  });
});
