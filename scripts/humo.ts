/**
 * Prueba de humo: crea una empresa y un cálculo reales, imprime sus ids y una
 * cookie de sesión válida para poder ejercitar las pantallas y las descargas.
 *
 * Correr con `npm run humo -- crear` y limpiar con `npm run humo -- limpiar`.
 */
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";

import { calculos, empresas, getDb } from "../src/lib/db";
import { crearEmpresa } from "../src/lib/datos/empresas";
import { guardarCalculo } from "../src/lib/datos/calculos";
import { leerTasas } from "../src/lib/datos/tasas";
import { calcularISN, centavosDesdeTexto, formatearPesos } from "../src/lib/isn";

const RFC_PRUEBA = "XAXX010101000";

async function cookieDeSesion(): Promise<string> {
  const secreto = new TextEncoder().encode(process.env.AUTH_SECRET!);

  return new SignJWT({ rol: "administradora" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secreto);
}

async function crear() {
  const empresa = await crearEmpresa({
    razonSocial: "Empresa de Prueba de Humo, S.A. de C.V.",
    rfc: RFC_PRUEBA,
    registroPatronal: "Y5512345108",
  });

  const resultado = calcularISN({
    baseGravableCentavos: centavosDesdeTexto("250,000.00"),
    periodo: { anio: 2026, mes: 6 },
    tasas: await leerTasas(),
  });

  const calculo = await guardarCalculo({
    empresaId: empresa.id,
    resultado,
    notas: "Cálculo generado por la prueba de humo.",
  });

  console.log("EMPRESA_ID=" + empresa.id);
  console.log("CALCULO_ID=" + calculo.id);
  console.log("COOKIE=" + (await cookieDeSesion()));
  console.log(
    `ESPERADO base=${formatearPesos(resultado.baseGravableCentavos)} tasa=${resultado.tasaPorcentaje} impuesto=${formatearPesos(resultado.impuestoCentavos)} vence=${resultado.fechaLimitePago}`,
  );
}

async function limpiar() {
  const db = getDb();
  const [empresa] = await db.select().from(empresas).where(eq(empresas.rfc, RFC_PRUEBA));

  if (!empresa) {
    console.log("Nada que limpiar.");
    return;
  }

  await db.delete(calculos).where(eq(calculos.empresaId, empresa.id));
  await db.delete(empresas).where(eq(empresas.id, empresa.id));
  console.log("Datos de prueba eliminados.");
}

const comando = process.argv[2];

(comando === "limpiar" ? limpiar() : crear())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
