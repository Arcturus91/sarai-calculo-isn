import { afterEach, describe, expect, it } from "vitest";

import { verificarContrasena } from "./contrasena";

const ORIGINAL = process.env.APP_PASSWORD;

afterEach(() => {
  process.env.APP_PASSWORD = ORIGINAL;
});

describe("verificarContrasena", () => {
  it("acepta la contraseña configurada", async () => {
    process.env.APP_PASSWORD = "unaContrasenaValida";

    await expect(verificarContrasena("unaContrasenaValida")).resolves.toEqual({ ok: true });
  });

  it("rechaza una contraseña distinta", async () => {
    process.env.APP_PASSWORD = "unaContrasenaValida";

    const resultado = await verificarContrasena("otraCosa");

    expect(resultado).toEqual({ ok: false, mensaje: "Contraseña incorrecta." });
  });

  it("distingue mayúsculas de minúsculas", async () => {
    process.env.APP_PASSWORD = "unaContrasenaValida";

    const resultado = await verificarContrasena("UNACONTRASENAVALIDA");

    expect(resultado.ok).toBe(false);
  });

  it("rechaza la cadena vacía", async () => {
    process.env.APP_PASSWORD = "unaContrasenaValida";

    const resultado = await verificarContrasena("");

    expect(resultado.ok).toBe(false);
  });

  it("no compara por prefijo: una contraseña más larga no entra", async () => {
    process.env.APP_PASSWORD = "unaContrasenaValida";

    const resultado = await verificarContrasena("unaContrasenaValidaYMas");

    expect(resultado.ok).toBe(false);
  });

  it("falla cerrado cuando no hay contraseña configurada", async () => {
    delete process.env.APP_PASSWORD;

    const resultado = await verificarContrasena("loQueSea");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.mensaje).toMatch(/APP_PASSWORD/);
    }
  });

  it("falla cerrado cuando la contraseña configurada es demasiado corta", async () => {
    process.env.APP_PASSWORD = "corta";

    const resultado = await verificarContrasena("corta");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.mensaje).toMatch(/corta/i);
    }
  });
});
