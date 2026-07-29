/**
 * Verifica contra la base de datos real que el limitador de intentos bloquea.
 *
 * Correr con `npm run probar:limite`. Usa un origen ficticio y lo deja limpio.
 */
import { LIMITE, limpiarIntentos, registrarFallo, revisarIntentos } from "../src/lib/auth/intentos";

const ORIGEN = "203.0.113.99"; // Rango reservado para documentación (RFC 5737).

async function probar() {
  await limpiarIntentos(ORIGEN);

  const inicial = await revisarIntentos(ORIGEN);
  console.log(`Sin fallos: bloqueado=${inicial.bloqueado} restantes=${inicial.restantes}`);
  if (inicial.bloqueado) {
    throw new Error("No debería estar bloqueado sin intentos previos.");
  }

  for (let intento = 1; intento <= LIMITE.MAXIMO_FALLOS; intento += 1) {
    await registrarFallo(ORIGEN);
  }

  const tras = await revisarIntentos(ORIGEN);
  console.log(
    `Tras ${LIMITE.MAXIMO_FALLOS} fallos: bloqueado=${tras.bloqueado} restantes=${tras.restantes}`,
  );
  if (!tras.bloqueado) {
    throw new Error("Debería estar bloqueado al llegar al máximo de fallos.");
  }

  await limpiarIntentos(ORIGEN);
  const despues = await revisarIntentos(ORIGEN);
  console.log(`Tras entrar bien: bloqueado=${despues.bloqueado} restantes=${despues.restantes}`);
  if (despues.bloqueado) {
    throw new Error("El bloqueo debería levantarse tras un acceso correcto.");
  }

  console.log("✓ El limitador de intentos funciona.");
}

probar()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("✗", error.message ?? error);
    process.exit(1);
  });
