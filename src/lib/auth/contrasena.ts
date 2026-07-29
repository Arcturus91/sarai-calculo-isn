import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Largo mínimo aceptado.
 *
 * Es bajo a propósito, porque la propietaria eligió una contraseña corta. Con
 * poca entropía, lo que realmente frena un ataque de fuerza bruta es el
 * limitador de intentos por IP —ver `intentos.ts`—, no este umbral.
 */
const LARGO_MINIMO = 8;

/** Retardo en cada intento fallido para encarecer los reintentos automatizados. */
const RETARDO_FALLO_MS = 600;

function huella(valor: string): Buffer {
  return createHash("sha256").update(valor, "utf8").digest();
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ResultadoAcceso =
  | { ok: true }
  | { ok: false; mensaje: string };

export async function verificarContrasena(intento: string): Promise<ResultadoAcceso> {
  const esperada = process.env.APP_PASSWORD;

  if (!esperada) {
    return {
      ok: false,
      mensaje:
        "La plataforma no tiene contraseña configurada. Define APP_PASSWORD en las variables de entorno de Vercel.",
    };
  }
  if (esperada.length < LARGO_MINIMO) {
    return {
      ok: false,
      mensaje: `La contraseña configurada es demasiado corta: debe tener al menos ${LARGO_MINIMO} caracteres.`,
    };
  }

  // Se comparan las huellas y no el texto: iguala el largo y evita filtrar
  // información por el tiempo que tarda la comparación.
  if (timingSafeEqual(huella(intento), huella(esperada))) {
    return { ok: true };
  }

  await esperar(RETARDO_FALLO_MS);

  return { ok: false, mensaje: "Contraseña incorrecta." };
}
