# Plataforma de cálculo de ISN — Coahuila

**Fecha:** 2026-07-29
**Cliente:** Saraí Martínez
**Estado:** Diseño aprobado

---

## Problema

La administradora necesita calcular mensualmente el Impuesto Sobre Nóminas (ISN) del estado de
Coahuila para una o más razones sociales, guardar el histórico y exportarlo. Hoy no tiene
herramienta: el cálculo se hace a mano y no queda registro consultable.

## Historias de usuario

1. Como administradora quiero una página que me ayude a calcular el ISN del estado de Coahuila.
2. Como administradora quiero capturar el sueldo del mes y que la plataforma genere el cálculo.

## Alcance

**Dentro:** ISN estatal de Coahuila únicamente. Captura de un monto global de erogaciones **ya
gravables**. Histórico persistente. Múltiples razones sociales. Exportación a PDF y Excel. Acceso
protegido por contraseña.

**Fuera (YAGNI):** ISR retenido a trabajadores, cuotas IMSS/INFONAVIT, desglose de conceptos exentos
del art. 32, estímulos del art. 30, captura por empleado, importación de Excel, otros estados.

---

## Fundamento legal (verificado 2026-07-29)

| Concepto | Valor | Fundamento |
|---|---|---|
| Tasa vigente | **3.00 %** | Art. 24, Ley de Hacienda para el Estado de Coahuila de Zaragoza |
| Vigencia de la tasa | Desde 2024-01-01 | Decreto 563 — reformó el art. 24 subiendo la tasa de 2 % a 3 % |
| Base gravable | Monto total de erogaciones por servicios personales subordinados y conceptos asimilados | Arts. 21 y 23 |
| Exenciones | Indemnizaciones, pensiones, PTU, aportaciones IMSS/INFONAVIT, tiempo extra dentro de límite, viáticos comprobados, despensa, gastos funerarios, entre otros | Art. 32 |
| Estímulos | Reducción del 20–50 % por contratar adultos mayores o personas con discapacidad | Art. 30 |
| Declaración y pago | Dentro de los primeros **17 días naturales** del mes siguiente | Art. 25 |

**Fuentes consultadas:**

- Ley de Hacienda para el Estado de Coahuila de Zaragoza — Congreso del Estado:
  <https://www.congresocoahuila.gob.mx/transparencia/03/Leyes_Coahuila/coa25.pdf>
- IDC Online, ficha ISN Coahuila: <https://idconline.mx/fiscal/impuestos-sobre-nominas/coahuila>
- Portal oficial ISN Coahuila: <https://isn.coahuila.gob.mx/>
- Tabla ISN 2026 por entidad, verificada a julio 2026:
  <https://www.academiadeamparo.com/p/impuesto-sobre-nominas-isn-2026-por.html>

> **Nota sobre fuentes en conflicto:** circulan tablas que reportan 2 % para Coahuila. Están
> desactualizadas: no reflejan el Decreto 563, vigente desde el 1° de enero de 2024. La tasa correcta
> para 2026 es 3 %.

### Punto abierto

El art. 25 fija el pago dentro de los primeros 17 días naturales del mes siguiente. Falta confirmar
contra el Código Fiscal de Coahuila si al caer el día 17 en día inhábil el plazo se recorre al
siguiente día hábil. Hasta confirmarlo, la plataforma muestra el día 17 con una nota visible al
usuario. **No se implementará el recorrido de plazo sin verificación documental.**

---

## Arquitectura

```
Next.js 16 (App Router, TypeScript)
├── src/lib/isn/          Cálculo puro — sin React, sin DB. Es el corazón y se prueba aislado.
├── src/lib/auth/         Sesión por cookie firmada.
├── src/lib/db/           Drizzle ORM sobre Neon Postgres.
├── src/app/(auth)/       Login.
├── src/app/(app)/        Empresas, nuevo cálculo, histórico. Protegido.
└── src/app/api/export/   Route handlers de PDF y Excel.
```

**Infraestructura:** GitHub (repo privado) → Vercel. Base de datos Neon Postgres provisionada desde
el Marketplace de Vercel (variables de entorno inyectadas automáticamente).

### Principio de aislamiento

`src/lib/isn/` no importa nada de React, Next ni de la base de datos. Recibe números y devuelve
números. Eso permite probarlo exhaustivamente y cambiar la UI o la persistencia sin tocar la lógica
fiscal — que es la parte donde un error cuesta dinero.

---

## Modelo de datos

### `empresas`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `razon_social` | text NOT NULL | |
| `rfc` | text NOT NULL | Validado con formato de RFC de persona moral o física |
| `registro_patronal` | text NULL | Opcional |
| `activa` | boolean DEFAULT true | Baja lógica; nunca se borra una empresa con cálculos |
| `creada_en` | timestamptz | |

### `tasas_isn`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `tasa` | numeric(7,6) NOT NULL | Fracción decimal. 3 % se guarda como `0.030000` |
| `vigente_desde` | date NOT NULL | |
| `vigente_hasta` | date NULL | `NULL` = vigente indefinidamente |
| `fundamento` | text NOT NULL | Ej. "Art. 24, Ley de Hacienda de Coahuila (Decreto 563)" |
| `fuente_url` | text NOT NULL | |
| `verificada_en` | date NOT NULL | Fecha en que se confirmó contra la fuente |

Semilla: `0.030000`, desde `2024-01-01`, sin fecha de fin.

### `calculos`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `empresa_id` | uuid FK → empresas | |
| `anio` | integer NOT NULL | |
| `mes` | integer NOT NULL | 1–12, con CHECK |
| `base_gravable_centavos` | bigint NOT NULL | Entero, ≥ 0 |
| `tasa_aplicada` | numeric(7,6) NOT NULL | **Copia** de la tasa usada |
| `impuesto_centavos` | bigint NOT NULL | **Copia** del resultado |
| `fundamento` | text NOT NULL | **Copia** del fundamento |
| `notas` | text NULL | |
| `creado_en` / `actualizado_en` | timestamptz | |

**UNIQUE (`empresa_id`, `anio`, `mes`)** — un solo cálculo por empresa y periodo. Recalcular
sobrescribe.

**Por qué se copian tasa, impuesto y fundamento:** si la tasa cambia en el futuro, los cálculos
históricos deben seguir mostrando exactamente lo que se declaró y pagó en su momento. Nunca se
recalcula el pasado.

### Manejo de dinero

Todos los montos se guardan y operan como **enteros en centavos**. Nunca se usa punto flotante para
dinero. La conversión a pesos ocurre solo en la capa de presentación.

Fórmula:

```
tasaEscalada  = round(tasa * 1_000_000)                       // 0.03 → 30_000
impuestoCents = round(baseCents * tasaEscalada / 1_000_000)   // redondeo al centavo
```

---

## Autenticación

Contraseña única, definida por la propietaria en la variable de entorno `APP_PASSWORD` de Vercel.

- Comparación en **tiempo constante** (`crypto.timingSafeEqual`) para no filtrar información por
  tiempos de respuesta.
- Sesión en cookie `httpOnly`, `secure`, `sameSite=lax`, firmada con `AUTH_SECRET` (JWT vía `jose`).
  Vigencia 7 días.
- Middleware protege todas las rutas salvo `/login` y estáticos.
- Retardo artificial en el intento fallido para encarecer la fuerza bruta.

**Limitación aceptada y documentada:** sin base de datos de usuarios no hay recuperación de
contraseña ni bloqueo persistente por IP entre instancias. Para cambiar la contraseña se edita la
variable de entorno en Vercel y se redespliega. El README exigirá una contraseña larga y aleatoria.
Si más adelante se necesitan varios usuarios o recuperación, se migra a Clerk sin tocar el modelo de
datos.

---

## Flujo de uso

1. **Login** — contraseña.
2. **Empresas** — alta y edición de razones sociales. Si solo hay una, se preselecciona.
3. **Nuevo cálculo** — se elige empresa, mes y año; se captura el monto gravable. La pantalla muestra
   en vivo la tasa vigente para ese periodo, el impuesto y la fecha límite de pago.
4. **Guardar** — queda en el histórico. Si ya existía un cálculo para ese periodo, se avisa antes de
   sobrescribir.
5. **Histórico** — tabla por empresa y año, con total anual.
6. **Exportar** — PDF (comprobante de un mes) y Excel (histórico anual de una empresa).

---

## Exportaciones

- **PDF:** route handler en runtime Node que genera el comprobante del mes con razón social, RFC,
  periodo, base gravable, tasa, impuesto, fecha límite y fundamento legal.
- **Excel:** route handler que genera un `.xlsx` con el histórico anual: un renglón por mes y fila de
  totales.

Ambos se generan en servidor, autenticados por el mismo middleware.

---

## Privacidad y cumplimiento

- **No se almacenan datos de trabajadores.** Solo montos agregados por empresa y periodo. Esto
  mantiene la plataforma fuera del manejo de datos personales de empleados.
- Aviso permanente en la interfaz: herramienta de apoyo administrativo; no sustituye la asesoría de
  un contador ni constituye una declaración oficial.
- Cada cálculo muestra el fundamento legal y la fecha de verificación de la tasa aplicada.

---

## Estrategia de pruebas

**TDD en el módulo de cálculo.** Se escriben las pruebas antes de la implementación.

Casos cubiertos:

- Cálculo base: 100 000.00 al 3 % = 3 000.00.
- Redondeo al centavo (hacia arriba y hacia abajo).
- Base cero → impuesto cero.
- Base negativa → error.
- Montos grandes sin pérdida de precisión.
- Selección de tasa por vigencia: un periodo de 2023 no puede usar la tasa que entró en 2024.
- Periodo sin tasa vigente → error explícito, nunca un cálculo silencioso con cero.
- Fecha límite: día 17 del mes siguiente, incluido el cruce de año (diciembre → 17 de enero).
- Validación de mes fuera de 1–12.

**Puertas de calidad antes del PR:** `vitest` en verde, `tsc --noEmit` limpio, `eslint` limpio,
`next build` exitoso.

---

## Entrega

- Repo privado en GitHub, rama de trabajo → PR a `main`. La propietaria mergea y despliega.
- README con: variables de entorno requeridas, cómo correr en local, cómo desplegar y cómo actualizar
  la tasa cuando el Congreso la reforme.
