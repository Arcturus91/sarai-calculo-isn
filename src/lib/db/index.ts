import { drizzle } from "drizzle-orm/neon-http";

import * as esquema from "./esquema";

type Conexion = ReturnType<typeof crearConexion>;

function crearConexion() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL. Corre `vercel env pull` o revisa la integración de Neon en Vercel.",
    );
  }

  return drizzle(url, { schema: esquema });
}

let conexion: Conexion | null = null;

/**
 * Conexión perezosa a Postgres.
 *
 * Se inicializa dentro de una función y no en el módulo porque Next evalúa el
 * código de nivel superior durante el build, cuando `DATABASE_URL` todavía no
 * existe. Tampoco se envuelve en un `Proxy`: rompe a las librerías que inspeccionan
 * el cliente.
 */
export function getDb(): Conexion {
  if (!conexion) {
    conexion = crearConexion();
  }

  return conexion;
}

export * from "./esquema";
