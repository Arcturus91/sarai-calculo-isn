import { z } from "zod";

/** RFC de persona moral (12) o física (13), ya normalizado a mayúsculas. */
const RFC_PATRON = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;

export const esquemaEmpresa = z.object({
  razonSocial: z
    .string()
    .min(3, "Escribe la razón social completa.")
    .max(200, "La razón social es demasiado larga."),
  rfc: z
    .string()
    .regex(RFC_PATRON, "El RFC no tiene un formato válido. Ejemplo: ABC010203XY9"),
  registroPatronal: z
    .string()
    .max(20, "El registro patronal es demasiado largo.")
    .nullable(),
});

export type DatosEmpresaValidados = z.infer<typeof esquemaEmpresa>;

/** Limpia lo que viene del formulario antes de validarlo. */
export function normalizarEmpresa(formulario: FormData): unknown {
  const registroPatronal = String(formulario.get("registroPatronal") ?? "").trim();

  return {
    razonSocial: String(formulario.get("razonSocial") ?? "").trim(),
    rfc: String(formulario.get("rfc") ?? "").trim().toUpperCase(),
    registroPatronal: registroPatronal === "" ? null : registroPatronal,
  };
}

/** Devuelve el primer mensaje de error, que es lo único que muestra el formulario. */
export function primerError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Revisa los datos capturados.";
}

/**
 * Evita el redirect abierto: solo se acepta una ruta interna.
 *
 * Sin esto, `/login?destino=https://otro-sitio` mandaría a la usuaria fuera de
 * la plataforma justo después de autenticarse.
 */
export function rutaInternaSegura(destino: string | undefined): string {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//")) {
    return "/";
  }

  return destino;
}
