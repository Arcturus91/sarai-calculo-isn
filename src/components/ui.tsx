import type { ComponentProps, ReactNode } from "react";

const CLASES_CAMPO =
  "w-full rounded-[2px] border border-regla bg-panel px-3 py-2.5 text-tinta " +
  "placeholder:text-tinta-tenue focus:border-sello";

export function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="rotulo block pb-1.5">{etiqueta}</span>
      {children}
      {ayuda ? <span className="mt-1.5 block text-xs text-tinta-suave">{ayuda}</span> : null}
    </label>
  );
}

export function Entrada({ className = "", ...props }: ComponentProps<"input">) {
  return <input {...props} className={`${CLASES_CAMPO} ${className}`} />;
}

export function Seleccion({ className = "", ...props }: ComponentProps<"select">) {
  return <select {...props} className={`${CLASES_CAMPO} ${className}`} />;
}

export function AreaTexto({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${CLASES_CAMPO} ${className}`} />;
}

type VarianteBoton = "primario" | "secundario" | "peligro";

const ESTILOS_BOTON: Record<VarianteBoton, string> = {
  primario: "bg-sello text-white hover:bg-[#0b5548]",
  secundario: "border border-regla bg-panel text-tinta hover:border-tinta-suave",
  peligro: "border border-copia bg-panel text-copia hover:bg-copia-tenue",
};

export function Boton({
  variante = "primario",
  className = "",
  ...props
}: ComponentProps<"button"> & { variante?: VarianteBoton }) {
  return (
    <button
      {...props}
      className={
        `inline-flex items-center justify-center rounded-[2px] px-4 py-2.5 text-sm font-medium ` +
        `transition-colors disabled:cursor-not-allowed disabled:opacity-50 ` +
        `${ESTILOS_BOTON[variante]} ${className}`
      }
    />
  );
}

export function Aviso({ tono, children }: { tono: "error" | "exito"; children: ReactNode }) {
  const estilos =
    tono === "error"
      ? "border-copia bg-copia-tenue text-copia"
      : "border-sello bg-sello-tenue text-sello";

  return (
    <p role="status" className={`rounded-[2px] border px-3 py-2.5 text-sm ${estilos}`}>
      {children}
    </p>
  );
}

/** Encabezado de pantalla: rótulo pequeño arriba, título grande abajo. */
export function Encabezado({ rotulo, titulo }: { rotulo: string; titulo: string }) {
  return (
    <header className="mb-8">
      <p className="rotulo">{rotulo}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{titulo}</h1>
    </header>
  );
}
