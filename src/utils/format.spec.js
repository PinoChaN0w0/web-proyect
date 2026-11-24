import { formatearPrecio } from "./format.js";

describe("formatearPrecio", () => {
  it("agrega el símbolo $ y el sufijo CLP", () => {
    const r = formatearPrecio(100);
    expect(r.startsWith("$")).toBeTrue();
    expect(r.endsWith(" CLP")).toBeTrue();
  });

  it("usa separador de miles es-CL (punto)", () => {
    expect(formatearPrecio(29990)).toBe("$29.990 CLP");
    expect(formatearPrecio(2299990)).toBe("$2.299.990 CLP");
  });

  it("formatea cero", () => {
    expect(formatearPrecio(0)).toBe("$0 CLP");
  });
});
