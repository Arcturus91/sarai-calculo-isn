# Plataforma de cálculo del ISN — Coahuila

Calcula, guarda y exporta el **Impuesto Sobre Nóminas** del estado de Coahuila, mes a mes y por razón
social.

## Qué hace

- Capturas la base gravable del mes y ves el impuesto, la tasa aplicada y la fecha límite de pago.
- Guarda el histórico por empresa y año, con totales anuales.
- Exporta el comprobante de un mes en PDF y el histórico anual en Excel.
- Maneja varias razones sociales.
- Acceso protegido por contraseña.

## Fundamento legal

| Concepto | Valor | Fundamento |
|---|---|---|
| Tasa | **3.00 %** desde el 2024-01-01 | Art. 24, Ley de Hacienda para el Estado de Coahuila de Zaragoza (Decreto 563) |
| Base gravable | Erogaciones por servicios personales subordinados y conceptos asimilados | Arts. 21 y 23 |
| Exenciones | Indemnizaciones, pensiones, PTU, aportaciones IMSS/INFONAVIT, tiempo extra dentro de límite, viáticos, despensa, gastos funerarios | Art. 32 |
| Pago | Primeros **17 días naturales** del mes siguiente | Art. 25 |

Fuente: <https://www.congresocoahuila.gob.mx/transparencia/03/Leyes_Coahuila/coa25.pdf> · verificado
el 2026-07-29.

> Circulan tablas que reportan **2 %** para Coahuila. Están desactualizadas: no reflejan el Decreto
> 563, vigente desde el 1° de enero de 2024.

**La plataforma no aplica las exenciones del art. 32 ni los estímulos del art. 30.** Se captura la
base ya gravable.

Queda un punto por confirmar contra el Código Fiscal del Estado: si el día 17 cae en día inhábil, el
plazo podría recorrerse al siguiente día hábil. Mientras no esté verificado, la plataforma muestra el
día 17 y lo advierte en pantalla.

## Cómo actualizar la tasa cuando el Congreso la reforme

La tasa vive en la tabla `tasas_isn`, no en el código. Para una reforma:

1. Cierra la vigencia de la tasa actual: pon `vigente_hasta` en el último día que aplicó.
2. Inserta un renglón nuevo con la tasa, su `vigente_desde`, el `fundamento` y la `fuente_url`.

Los cálculos ya guardados **no cambian**: cada uno conserva la tasa y el fundamento con que se hizo.

## Correr en local

```bash
npm install
vercel env pull .env.local   # trae DATABASE_URL, APP_PASSWORD y AUTH_SECRET
npm run db:migrate           # aplica las migraciones
npm run db:seed              # siembra la tasa vigente (idempotente)
npm run dev
```

## Variables de entorno

| Variable | Para qué | Origen |
|---|---|---|
| `DATABASE_URL` | Postgres | La inyecta la integración de Neon en Vercel |
| `APP_PASSWORD` | Contraseña de acceso | La defines tú en Vercel |
| `AUTH_SECRET` | Firma de la cookie de sesión. Mínimo 32 caracteres | `openssl rand -base64 32` |

Para cambiar la contraseña:

```bash
vercel env add APP_PASSWORD production --value "tu-nueva-contrasena" --yes --force
vercel env add APP_PASSWORD development --value "tu-nueva-contrasena" --yes --force
```

Vuelve a desplegar para que tome efecto.

### Sobre la seguridad del acceso

Hay un solo candado: la contraseña. Como es corta, la defensa real contra un ataque de fuerza bruta
es el **limitador de intentos**: 8 fallos por IP en 15 minutos bloquean el acceso, y el contador vive
en la base de datos para que funcione entre instancias de Vercel. Aun así, una contraseña larga y
aleatoria sería bastante más segura; se cambia con el comando de arriba y no requiere tocar código.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm test` | Pruebas del módulo de cálculo y de la contraseña |
| `npm run typecheck` | Revisa tipos |
| `npm run db:generate` | Genera una migración a partir del esquema |
| `npm run db:migrate` | Aplica las migraciones |
| `npm run db:seed` | Siembra el catálogo de tasas |
| `npm run probar:limite` | Verifica el limitador de intentos contra la base real |
| `npm run humo` | Crea datos de prueba (`-- limpiar` los borra) |

## Cómo está organizado

```
src/
├── lib/isn/          Cálculo puro: sin React, sin base de datos. Es donde están las pruebas.
├── lib/db/           Esquema y conexión (Drizzle + Neon Postgres).
├── lib/datos/        Consultas: empresas, cálculos, tasas.
├── lib/auth/         Contraseña, sesión y limitador de intentos.
├── lib/exportar/     Generación de PDF y Excel.
├── app/(privado)/    Calculadora, empresas e histórico.
├── app/login/        Acceso.
├── app/api/exportar/ Descargas.
└── proxy.ts          Protege todas las rutas salvo /login.
```

**El dinero se maneja siempre en centavos enteros.** La multiplicación `base × tasa` se hace en
`BigInt` porque rebasa el entero seguro de JavaScript en nóminas grandes. Nunca se usa punto flotante
para dinero.

## Aviso

Herramienta de apoyo administrativo. No sustituye la asesoría de un contador ni constituye una
declaración oficial ante la Secretaría de Finanzas del Estado de Coahuila.
