import ExcelJS from "exceljs";

import type { CalculoFila, EmpresaFila } from "@/lib/db";
import { fechaLegible, fechaLimitePago, nombreMes, tasaComoPorcentaje } from "@/lib/isn";

const FORMATO_PESOS = '"$"#,##0.00';

export type DatosHistorico = {
  empresa: EmpresaFila;
  anio: number;
  calculos: CalculoFila[];
};

/**
 * Histórico anual en .xlsx.
 *
 * Los importes van como número —no como texto— para que se puedan sumar y
 * graficar en Excel; el formato de moneda es solo presentación.
 */
export async function historicoExcel(entrada: DatosHistorico): Promise<Uint8Array> {
  const { empresa, anio, calculos } = entrada;

  const libro = new ExcelJS.Workbook();
  libro.creator = "Plataforma ISN Coahuila";
  const hoja = libro.addWorksheet(String(anio));

  hoja.mergeCells("A1:F1");
  hoja.getCell("A1").value = empresa.razonSocial;
  hoja.getCell("A1").font = { bold: true, size: 14 };

  hoja.mergeCells("A2:F2");
  hoja.getCell("A2").value = `RFC ${empresa.rfc} · Impuesto Sobre Nóminas de Coahuila · Ejercicio ${anio}`;
  hoja.getCell("A2").font = { size: 10, color: { argb: "FF5C6B77" } };

  hoja.addRow([]);

  const encabezado = hoja.addRow([
    "Mes",
    "Base gravable",
    "Tasa",
    "Impuesto",
    "Fecha límite de pago",
    "Notas",
  ]);
  encabezado.font = { bold: true };
  encabezado.border = { bottom: { style: "thin", color: { argb: "FFD3D9DE" } } };

  for (const calculo of calculos) {
    hoja.addRow([
      nombreMes(calculo.mes),
      calculo.baseGravableCentavos / 100,
      tasaComoPorcentaje(calculo.tasaAplicada),
      calculo.impuestoCentavos / 100,
      fechaLegible(fechaLimitePago({ anio: calculo.anio, mes: calculo.mes })),
      calculo.notas ?? "",
    ]);
  }

  const totales = hoja.addRow([
    `Total ${anio}`,
    calculos.reduce((suma, fila) => suma + fila.baseGravableCentavos, 0) / 100,
    "",
    calculos.reduce((suma, fila) => suma + fila.impuestoCentavos, 0) / 100,
    "",
    "",
  ]);
  totales.font = { bold: true };
  totales.border = { top: { style: "thin", color: { argb: "FFD3D9DE" } } };

  hoja.getColumn(2).numFmt = FORMATO_PESOS;
  hoja.getColumn(4).numFmt = FORMATO_PESOS;
  hoja.columns.forEach((columna, indice) => {
    columna.width = [16, 18, 10, 18, 26, 40][indice] ?? 16;
  });

  // ExcelJS devuelve su propio tipo de buffer; se normaliza a Uint8Array para
  // que la ruta lo entregue igual que el PDF.
  const contenido = await libro.xlsx.writeBuffer();

  return new Uint8Array(contenido as ArrayBuffer);
}
