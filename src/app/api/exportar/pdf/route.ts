import { NextResponse } from "next/server";

import { haySesion } from "@/lib/auth/sesion";
import { obtenerCalculoPorId } from "@/lib/datos/calculos";
import { obtenerEmpresa } from "@/lib/datos/empresas";
import { comprobantePdf } from "@/lib/exportar/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(peticion: Request) {
  if (!(await haySesion())) {
    return new NextResponse("No autorizado.", { status: 401 });
  }

  const id = new URL(peticion.url).searchParams.get("calculo");
  if (!id || !UUID.test(id)) {
    return new NextResponse("Falta el identificador del cálculo o no es válido.", {
      status: 400,
    });
  }

  const calculo = await obtenerCalculoPorId(id);
  if (!calculo) {
    return new NextResponse("No se encontró el cálculo.", { status: 404 });
  }

  const empresa = await obtenerEmpresa(calculo.empresaId);
  if (!empresa) {
    return new NextResponse("No se encontró la empresa del cálculo.", { status: 404 });
  }

  const pdf = await comprobantePdf({ empresa, calculo, generadoEn: new Date() });
  const periodo = `${calculo.anio}-${String(calculo.mes).padStart(2, "0")}`;

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ISN-${empresa.rfc}-${periodo}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
