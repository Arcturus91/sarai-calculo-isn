import { describe, expect, it } from "vitest";

import { centavosDesdeTexto, formatearPesos, pesosDesdeCentavos } from "./dinero";

describe("centavosDesdeTexto", () => {
  it("convierte un monto entero a centavos", () => {
    expect(centavosDesdeTexto("100000")).toBe(10_000_000);
  });

  it("convierte un monto con dos decimales", () => {
    expect(centavosDesdeTexto("1234.56")).toBe(123_456);
  });

  it("completa el segundo decimal cuando solo se escribe uno", () => {
    expect(centavosDesdeTexto("10.5")).toBe(1_050);
  });

  it("acepta separadores de miles y signo de pesos", () => {
    expect(centavosDesdeTexto("$1,234,567.89")).toBe(123_456_789);
  });

  it("acepta espacios alrededor", () => {
    expect(centavosDesdeTexto("  500.00  ")).toBe(50_000);
  });

  it("acepta cero", () => {
    expect(centavosDesdeTexto("0")).toBe(0);
  });

  it("rechaza montos negativos", () => {
    expect(() => centavosDesdeTexto("-100")).toThrow(/negativo/i);
  });

  it("rechaza más de dos decimales por ser ambiguo", () => {
    expect(() => centavosDesdeTexto("100.555")).toThrow(/dos decimales/i);
  });

  it("rechaza texto que no es un monto", () => {
    expect(() => centavosDesdeTexto("abc")).toThrow(/monto/i);
  });

  it("rechaza cadena vacía", () => {
    expect(() => centavosDesdeTexto("   ")).toThrow(/monto/i);
  });

  it("conserva la precisión en montos muy grandes", () => {
    // Mil millones de pesos con centavos.
    expect(centavosDesdeTexto("1000000000.01")).toBe(100_000_000_001);
  });
});

describe("pesosDesdeCentavos", () => {
  it("convierte centavos a una cadena de pesos con dos decimales", () => {
    expect(pesosDesdeCentavos(123_456)).toBe("1234.56");
  });

  it("rellena los centavos faltantes", () => {
    expect(pesosDesdeCentavos(1_050)).toBe("10.50");
    expect(pesosDesdeCentavos(5)).toBe("0.05");
  });

  it("maneja el cero", () => {
    expect(pesosDesdeCentavos(0)).toBe("0.00");
  });
});

describe("formatearPesos", () => {
  it("da formato de moneda mexicana con separadores de miles", () => {
    // Se normaliza el espacio porque Intl puede usar espacio duro.
    expect(formatearPesos(123_456_789).replace(/ /g, " ")).toBe("$1,234,567.89");
  });

  it("da formato al cero", () => {
    expect(formatearPesos(0).replace(/ /g, " ")).toBe("$0.00");
  });
});
