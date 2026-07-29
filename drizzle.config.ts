import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/esquema.ts",
  out: "./drizzle",
  dbCredentials: {
    // drizzle-kit no carga .env.local: los scripts de package.json usan dotenv-cli.
    url: process.env.DATABASE_URL!,
  },
});
