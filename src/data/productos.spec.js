import { productos, idsDestacados, categorias } from "./productos.js";

describe("catálogo de productos", () => {
  it("tiene 10 productos con campos obligatorios", () => {
    expect(productos.length).toBe(10);
    productos.forEach((p) => {
      expect(p.nombre).toBeTruthy();
      expect(p.precio).toBeGreaterThan(0);
      expect(p.categoria).toBeTruthy();
    });
  });

  it("los ids son únicos", () => {
    const ids = productos.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("los destacados existen en el catálogo", () => {
    idsDestacados.forEach((id) =>
      expect(productos.some((p) => p.id === id)).withContext(`id ${id}`).toBeTrue()
    );
  });

  it("categorias no tiene duplicados", () => {
    expect(new Set(categorias).size).toBe(categorias.length);
  });
});
