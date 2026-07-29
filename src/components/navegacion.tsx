"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/", texto: "Calcular" },
  { href: "/empresas", texto: "Empresas" },
  { href: "/historico", texto: "Histórico" },
] as const;

export function Navegacion() {
  const ruta = usePathname();

  return (
    <nav className="flex gap-1" aria-label="Secciones">
      {ENLACES.map((enlace) => {
        const activo =
          enlace.href === "/" ? ruta === "/" : ruta.startsWith(enlace.href);

        return (
          <Link
            key={enlace.href}
            href={enlace.href}
            aria-current={activo ? "page" : undefined}
            className={
              "rounded-[2px] px-3 py-1.5 text-sm transition-colors " +
              (activo
                ? "bg-sello-tenue font-medium text-sello"
                : "text-tinta-suave hover:text-tinta")
            }
          >
            {enlace.texto}
          </Link>
        );
      })}
    </nav>
  );
}
