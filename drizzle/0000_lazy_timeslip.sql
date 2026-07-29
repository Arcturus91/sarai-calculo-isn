CREATE TABLE "calculos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"anio" integer NOT NULL,
	"mes" integer NOT NULL,
	"base_gravable_centavos" bigint NOT NULL,
	"tasa_aplicada" numeric(7, 6) NOT NULL,
	"impuesto_centavos" bigint NOT NULL,
	"fundamento" text NOT NULL,
	"notas" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calculos_mes_valido" CHECK ("calculos"."mes" between 1 and 12),
	CONSTRAINT "calculos_anio_valido" CHECK ("calculos"."anio" between 2000 and 2100),
	CONSTRAINT "calculos_base_no_negativa" CHECK ("calculos"."base_gravable_centavos" >= 0),
	CONSTRAINT "calculos_impuesto_no_negativo" CHECK ("calculos"."impuesto_centavos" >= 0)
);
--> statement-breakpoint
CREATE TABLE "empresas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"razon_social" text NOT NULL,
	"rfc" text NOT NULL,
	"registro_patronal" text,
	"activa" boolean DEFAULT true NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasas_isn" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tasa" numeric(7, 6) NOT NULL,
	"vigente_desde" date NOT NULL,
	"vigente_hasta" date,
	"fundamento" text NOT NULL,
	"fuente_url" text NOT NULL,
	"verificada_en" date NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calculos" ADD CONSTRAINT "calculos_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "calculos_empresa_periodo_uq" ON "calculos" USING btree ("empresa_id","anio","mes");