import { NextResponse } from "next/server";

import { haySesion } from "@/lib/auth/sesion";
import { listarCalculosDelAnio } from "@/lib/datos/calculos";
import { obtenerEmpresa } from "@/lib/datos/empresas";
import { historicoExcel } from "@/lib/exportar/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIPO_XLSX =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(peticion: Request) {
  if (!(await haySesion())) {
    return new NextResponse("No autorizado.", { status: 401 });
  }

  const parametros = new URL(peticion.url).searchParams;
  const empresaId = parametros.get("empresa");
  const anio = Number(parametros.get("anio"));

  if (!empresaId || !UUID.test(empresaId)) {
    return new NextResponse("Falta el identificador de la empresa o no es válido.", {
      status: 400,
    });
  }
  if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
    return new NextResponse("El año no es válido.", { status: 400 });
  }

  const empresa = await obtenerEmpresa(empresaId);
  if (!empresa) {
    return new NextResponse("No se encontró la empresa.", { status: 404 });
  }

  const calculos = await listarCalculosDelAnio(empresaId, anio);
  const libro = await historicoExcel({ empresa, anio, calculos });

  return new NextResponse(Buffer.from(libro), {
    headers: {
      "Content-Type": TIPO_XLSX,
      "Content-Disposition": `attachment; filename="ISN-${empresa.rfc}-${anio}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
