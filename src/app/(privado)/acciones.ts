"use server";

import { revalidatePath } from "next/cache";

import { exigirSesion } from "@/lib/auth/guardia";
import { guardarCalculo, obtenerCalculo } from "@/lib/datos/calculos";
import { leerTasas } from "@/lib/datos/tasas";
import { calcularISN, centavosDesdeTexto, etiquetaPeriodo } from "@/lib/isn";

export type EstadoCalculo =
  | { estado: "inicial" }
  | { estado: "error"; mensaje: string }
  | { estado: "confirmar"; mensaje: string }
  | { estado: "guardado"; mensaje: string };

export async function guardarCalculoAccion(
  _estadoPrevio: EstadoCalculo,
  formulario: FormData,
): Promise<EstadoCalculo> {
  await exigirSesion();

  const empresaId = String(formulario.get("empresaId") ?? "");
  if (empresaId === "") {
    return { estado: "error", mensaje: "Elige la empresa antes de guardar." };
  }

  const periodo = {
    anio: Number(formulario.get("anio")),
    mes: Number(formulario.get("mes")),
  };

  try {
    const baseGravableCentavos = centavosDesdeTexto(String(formulario.get("base") ?? ""));
    const resultado = calcularISN({
      baseGravableCentavos,
      periodo,
      tasas: await leerTasas(),
    });

    // Reemplazar un periodo ya declarado nunca debe pasar por accidente.
    if (formulario.get("confirmado") !== "si") {
      const existente = await obtenerCalculo(empresaId, periodo);
      if (existente) {
        return {
          estado: "confirmar",
          mensaje: `Ya hay un cálculo guardado para ${etiquetaPeriodo(periodo)}. Si continúas, se reemplaza.`,
        };
      }
    }

    const notas = String(formulario.get("notas") ?? "").trim();
    await guardarCalculo({
      empresaId,
      resultado,
      notas: notas === "" ? null : notas,
    });

    revalidatePath("/historico");

    return {
      estado: "guardado",
      mensaje: `Cálculo de ${etiquetaPeriodo(periodo)} guardado.`,
    };
  } catch (error) {
    return {
      estado: "error",
      mensaje: error instanceof Error ? error.message : "No se pudo guardar el cálculo.",
    };
  }
}
