import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const NOMBRE_COOKIE = "isn_sesion";

const DURACION_DIAS = 7;
const DURACION_SEGUNDOS = DURACION_DIAS * 24 * 60 * 60;

function secreto(): Uint8Array {
  const valor = process.env.AUTH_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error(
      "Falta AUTH_SECRET o es demasiado corto. Debe tener al menos 32 caracteres. Genera uno con: openssl rand -base64 32",
    );
  }

  return new TextEncoder().encode(valor);
}

async function firmarToken(): Promise<string> {
  return new SignJWT({ rol: "administradora" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_DIAS}d`)
    .sign(secreto());
}

/**
 * Valida el token de sesión.
 *
 * Cualquier fallo —token vencido, firma inválida o `AUTH_SECRET` sin configurar—
 * devuelve `false`. Falla cerrado: ante la duda, no hay sesión.
 */
export async function verificarSesion(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, secreto(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function iniciarSesion(): Promise<void> {
  const almacen = await cookies();

  almacen.set(NOMBRE_COOKIE, await firmarToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
}

export async function cerrarSesion(): Promise<void> {
  const almacen = await cookies();
  almacen.delete(NOMBRE_COOKIE);
}

/** Para usar dentro de componentes de servidor y acciones. */
export async function haySesion(): Promise<boolean> {
  const almacen = await cookies();

  return verificarSesion(almacen.get(NOMBRE_COOKIE)?.value);
}
