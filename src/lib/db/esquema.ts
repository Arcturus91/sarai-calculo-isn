import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Razones sociales de la administradora. */
export const empresas = pgTable("empresas", {
  id: uuid("id").primaryKey().defaultRandom(),
  razonSocial: text("razon_social").notNull(),
  rfc: text("rfc").notNull(),
  registroPatronal: text("registro_patronal"),
  /** Baja lógica: una empresa con cálculos nunca se borra, se desactiva. */
  activa: boolean("activa").notNull().default(true),
  creadaEn: timestamp("creada_en", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Catálogo de tasas del ISN con su vigencia.
 *
 * Vive en la base de datos y no en el código para que una reforma al art. 24 se
 * atienda agregando un renglón, sin volver a desplegar la aplicación.
 */
export const tasasIsn = pgTable("tasas_isn", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Fracción decimal: 3% se guarda como 0.030000. */
  tasa: numeric("tasa", { precision: 7, scale: 6 }).notNull(),
  vigenteDesde: date("vigente_desde").notNull(),
  vigenteHasta: date("vigente_hasta"),
  fundamento: text("fundamento").notNull(),
  fuenteUrl: text("fuente_url").notNull(),
  verificadaEn: date("verificada_en").notNull(),
});

/**
 * Un cálculo por empresa y periodo.
 *
 * La tasa, el impuesto y el fundamento se copian aquí a propósito. Si mañana
 * cambia la tasa, lo que se declaró y pagó en un mes anterior debe seguir
 * mostrándose exactamente como fue. El pasado no se recalcula.
 */
export const calculos = pgTable(
  "calculos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "restrict" }),
    anio: integer("anio").notNull(),
    mes: integer("mes").notNull(),
    baseGravableCentavos: bigint("base_gravable_centavos", { mode: "number" }).notNull(),
    tasaAplicada: numeric("tasa_aplicada", { precision: 7, scale: 6 }).notNull(),
    impuestoCentavos: bigint("impuesto_centavos", { mode: "number" }).notNull(),
    fundamento: text("fundamento").notNull(),
    notas: text("notas"),
    creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabla) => [
    uniqueIndex("calculos_empresa_periodo_uq").on(tabla.empresaId, tabla.anio, tabla.mes),
    check("calculos_mes_valido", sql`${tabla.mes} between 1 and 12`),
    check("calculos_anio_valido", sql`${tabla.anio} between 2000 and 2100`),
    check("calculos_base_no_negativa", sql`${tabla.baseGravableCentavos} >= 0`),
    check("calculos_impuesto_no_negativo", sql`${tabla.impuestoCentavos} >= 0`),
  ],
);

export type EmpresaFila = typeof empresas.$inferSelect;
export type EmpresaNueva = typeof empresas.$inferInsert;
export type TasaFila = typeof tasasIsn.$inferSelect;
export type CalculoFila = typeof calculos.$inferSelect;
