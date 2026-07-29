import { and, count, eq, gte, lt } from "drizzle-orm";
import { headers } from "next/headers";

import { getDb, intentosAcceso } from "@/lib/db";

const VENTANA_MINUTOS = 15;
const MAXIMO_FALLOS = 8;
/** Las filas viejas se barren solas para que la tabla no crezca sin control. */
const RETENCION_HORAS = 24;

/** IP de quien llama, según la cabecera que pone Vercel delante de la función. */
export async function origenDeLaPeticion(): Promise<string> {
  const cabeceras = await headers();
  const reenviada = cabeceras.get("x-forwarded-for");

  return reenviada?.split(",")[0]?.trim() || cabeceras.get("x-real-ip") || "desconocido";
}

function haceMinutos(minutos: number): Date {
  return new Date(Date.now() - minutos * 60_000);
}

export type EstadoIntentos = { bloqueado: boolean; restantes: number };

export async function revisarIntentos(origen: string): Promise<EstadoIntentos> {
  const [fila] = await getDb()
    .select({ fallos: count() })
    .from(intentosAcceso)
    .where(
      and(
        eq(intentosAcceso.origen, origen),
        gte(intentosAcceso.ocurrioEn, haceMinutos(VENTANA_MINUTOS)),
      ),
    );

  const fallos = fila?.fallos ?? 0;

  return {
    bloqueado: fallos >= MAXIMO_FALLOS,
    restantes: Math.max(0, MAXIMO_FALLOS - fallos),
  };
}

export async function registrarFallo(origen: string): Promise<void> {
  const db = getDb();

  await db.insert(intentosAcceso).values({ origen });
  await db
    .delete(intentosAcceso)
    .where(lt(intentosAcceso.ocurrioEn, haceMinutos(RETENCION_HORAS * 60)));
}

/** Al entrar bien se borra el historial: la usuaria legítima no arrastra castigo. */
export async function limpiarIntentos(origen: string): Promise<void> {
  await getDb().delete(intentosAcceso).where(eq(intentosAcceso.origen, origen));
}

export const LIMITE = { VENTANA_MINUTOS, MAXIMO_FALLOS };
