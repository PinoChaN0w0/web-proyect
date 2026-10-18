import { describe, expect, it } from "vitest";
import { esCorreoDuoc, esEmailValido, esMayorDeEdad } from "./validators.js";

// Nota: new Date("YYYY-MM-DD") se interpreta en UTC, por lo que en horarios
// negativos (Chile) cae un día antes en local. Para que los casos límite sean
// deterministas en cualquier zona horaria, usamos fechas con búfer de ±3 días
// construidas con componentes locales.
const aCadenaLocal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const hoy = new Date();
/** Cadena de nacimiento hace `anios` años y `diasExtra` días adicionales. */
const nacimiento = (anios, diasExtra = 0) =>
  aCadenaLocal(new Date(hoy.getFullYear() - anios, hoy.getMonth(), hoy.getDate() - diasExtra));

describe("esMayorDeEdad", () => {
  it("acepta a alguien claramente mayor de 18", () => {
    expect(esMayorDeEdad(nacimiento(30))).toBe(true);
  });

  it("caso límite: cumplió 18 hace pocos días", () => {
    expect(esMayorDeEdad(nacimiento(18, 3))).toBe(true);
  });

  it("caso límite: aún no cumple 18 (faltan días para el cumpleaños)", () => {
    expect(esMayorDeEdad(nacimiento(18, -3))).toBe(false);
  });

  it("rechaza a alguien de 17 años", () => {
    expect(esMayorDeEdad(nacimiento(17))).toBe(false);
  });

  it("rechaza un recién nacido", () => {
    expect(esMayorDeEdad(nacimiento(0))).toBe(false);
  });

  it("caso borde: cadena vacía", () => {
    expect(esMayorDeEdad("")).toBe(false);
  });

  it("caso de error: fecha inválida produce NaN y se rechaza", () => {
    expect(esMayorDeEdad("no-es-una-fecha")).toBe(false);
  });
});

describe("esEmailValido", () => {
  it("acepta un correo válido", () => {
    expect(esEmailValido("persona@ejemplo.cl")).toBe(true);
  });

  it("acepta correo con subdominio y +", () => {
    expect(esEmailValido("persona.sub+tag@dominio.com")).toBe(true);
  });

  it("rechaza correo sin @", () => {
    expect(esEmailValido("personadominio.cl")).toBe(false);
  });

  it("rechaza correo sin dominio", () => {
    expect(esEmailValido("persona@")).toBe(false);
  });

  it("rechaza correo con dos @", () => {
    expect(esEmailValido("a@@b.cl")).toBe(false);
  });

  it("rechaza correo con espacios", () => {
    expect(esEmailValido("persona @ejemplo.cl")).toBe(false);
  });

  it("caso borde: cadena vacía", () => {
    expect(esEmailValido("")).toBe(false);
  });
});

describe("esCorreoDuoc", () => {
  it("reconoce @duocuc.cl", () => {
    expect(esCorreoDuoc("alumno@duocuc.cl")).toBe(true);
  });

  it("reconoce @duoc.cl", () => {
    expect(esCorreoDuoc("profesor@duoc.cl")).toBe(true);
  });

  it("rechaza otros dominios", () => {
    expect(esCorreoDuoc("alumno@ejemplo.cl")).toBe(false);
  });

  it("rechaza dominios que solo terminan parecidos (sufijo falso)", () => {
    expect(esCorreoDuoc("alumno@noduocuc.cl")).toBe(false);
  });

  it("es sensible a mayúsculas (el login normaliza a minúsculas antes)", () => {
    expect(esCorreoDuoc("ALUMNO@DUOC.CL")).toBe(false);
  });

  it("caso borde: cadena vacía", () => {
    expect(esCorreoDuoc("")).toBe(false);
  });
});
