import { Navegacion } from "@/components/navegacion";
import { salir } from "../login/acciones";

export default function LayoutPrivado({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-regla bg-panel">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
          <p className="mr-auto text-sm font-semibold tracking-tight">
            ISN <span className="text-tinta-tenue">·</span> Coahuila
          </p>

          <Navegacion />

          <form action={salir}>
            <button
              type="submit"
              className="rounded-[2px] px-3 py-1.5 text-sm text-tinta-suave transition-colors hover:text-tinta"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>

      <footer className="border-t border-regla px-6 py-6">
        <p className="mx-auto max-w-5xl text-xs leading-relaxed text-tinta-suave">
          Herramienta de apoyo administrativo. No sustituye la asesoría de un contador ni
          constituye una declaración oficial ante la Secretaría de Finanzas del Estado de
          Coahuila. Verifica la tasa vigente antes de presentar.
        </p>
      </footer>
    </>
  );
}
