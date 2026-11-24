import { esEmailValido, esCorreoDuoc, esMayorDeEdad } from "./validators.js";

describe("esEmailValido", () => {
  it("acepta correos con formato válido", () => {
    expect(esEmailValido("ana@levelup.cl")).toBeTrue();
    expect(esEmailValido("a.b+c@sub.dominio.com")).toBeTrue();
  });

  it("rechaza correos inválidos", () => {
    ["", "sin-arroba", "a@b", "a b@c.cl", "@c.cl"].forEach((e) =>
      expect(esEmailValido(e)).withContext(e).toBeFalse()
    );
  });
});

describe("esCorreoDuoc", () => {
  it("detecta dominios Duoc", () => {
    expect(esCorreoDuoc("alumno@duocuc.cl")).toBeTrue();
    expect(esCorreoDuoc("profe@duoc.cl")).toBeTrue();
  });

  it("no da descuento a otros dominios", () => {
    expect(esCorreoDuoc("alguien@gmail.com")).toBeFalse();
    expect(esCorreoDuoc("fake@duocuc.cl.evil.com")).toBeFalse();
  });
});

describe("esMayorDeEdad", () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 5, 15)); // 15-jun-2026
  });
  afterEach(() => jasmine.clock().uninstall());

  it("true si cumplió 18 hoy", () => {
    expect(esMayorDeEdad("2008-06-15T12:00:00")).toBeTrue();
  });

  it("false si cumple 18 mañana", () => {
    expect(esMayorDeEdad("2008-06-16T12:00:00")).toBeFalse();
  });

  it("false para un menor y true para un adulto", () => {
    expect(esMayorDeEdad("2015-01-01T12:00:00")).toBeFalse();
    expect(esMayorDeEdad("1990-01-01T12:00:00")).toBeTrue();
  });
});
