import { NextResponse, type NextRequest } from "next/server";

import { NOMBRE_COOKIE, verificarSesion } from "@/lib/auth/sesion";

const RUTA_LOGIN = "/login";

/**
 * Puerta de entrada: sin sesión válida no se llega a ninguna pantalla.
 *
 * En Next.js 16 esta es la convención `proxy.ts`, que sustituye a `middleware.ts`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const esLogin = pathname === RUTA_LOGIN;
  const autenticada = await verificarSesion(request.cookies.get(NOMBRE_COOKIE)?.value);

  if (!autenticada && !esLogin) {
    const destino = new URL(RUTA_LOGIN, request.nextUrl);
    if (pathname !== "/") {
      destino.searchParams.set("destino", pathname);
    }
    return NextResponse.redirect(destino);
  }

  if (autenticada && esLogin) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|webmanifest)$).*)",
  ],
};
