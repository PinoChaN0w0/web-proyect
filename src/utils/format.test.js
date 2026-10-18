import { describe, expect, it } from "vitest";
import { formatearPrecio } from "./format.js";

describe("formatearPrecio", () => {
  it("formatea un precio típico del catálogo con separador de miles es-CL", () => {
    expect(formatearPrecio(29990)).toBe("$29.990 CLP");
  });

  it("formatea un precio mayor al millón", () => {
    expect(formatearPrecio(2299990)).toBe("$2.299.990 CLP");
  });

  it("caso borde: precio 0", () => {
    expect(formatearPrecio(0)).toBe("$0 CLP");
  });

  it("caso borde: precio exactamente 1000", () => {
    expect(formatearPrecio(1000)).toBe("$1.000 CLP");
  });

  it("siempre termina en ' CLP' y parte con '$'", () => {
    const salida = formatearPrecio(1500);
    expect(salida.startsWith("$")).toBe(true);
    expect(salida.endsWith(" CLP")).toBe(true);
  });
});
