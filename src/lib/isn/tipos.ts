/** Periodo mensual de causación del impuesto. `mes` va del 1 al 12. */
export type Periodo = {
  anio: number;
  mes: number;
};

/**
 * Tasa del ISN con su vigencia y su fundamento legal.
 *
 * `tasa` se guarda como fracción decimal en texto ("0.030000" = 3%) para no
 * perder precisión al pasar por la base de datos ni por JSON.
 */
export type TasaISN = {
  tasa: string;
  /** Fecha ISO `YYYY-MM-DD` a partir de la cual aplica. */
  vigenteDesde: string;
  /** Fecha ISO `YYYY-MM-DD` en que dejó de aplicar, o `null` si sigue vigente. */
  vigenteHasta: string | null;
  fundamento: string;
  fuenteUrl: string;
  /** Fecha en que se confirmó la tasa contra la fuente oficial. */
  verificadaEn: string;
};

/** Resultado del cálculo de un periodo, con todo lo necesario para respaldarlo. */
export type ResultadoISN = {
  periodo: Periodo;
  baseGravableCentavos: number;
  tasa: string;
  tasaPorcentaje: string;
  impuestoCentavos: number;
  fundamento: string;
  fuenteUrl: string;
  /** Fecha ISO `YYYY-MM-DD` límite para presentar y pagar. */
  fechaLimitePago: string;
};
