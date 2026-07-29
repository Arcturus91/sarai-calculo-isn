CREATE TABLE "intentos_acceso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origen" text NOT NULL,
	"ocurrio_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "intentos_origen_fecha_idx" ON "intentos_acceso" USING btree ("origen","ocurrio_en");