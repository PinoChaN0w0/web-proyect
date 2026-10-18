import { describe, expect, it } from "vitest";
import { categorias, idsDestacados, productos } from "./productos.js";

describe("catálogo de productos", () => {
  it("contiene 10 productos", () => {
    expect(productos).toHaveLength(10);
  });

  it("todos los ids son únicos", () => {
    const ids = productos.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todos los precios son números positivos enteros", () => {
    for (const p of productos) {
      expect(typeof p.precio).toBe("number");
      expect(Number.isInteger(p.precio)).toBe(true);
      expect(p.precio).toBeGreaterThan(0);
    }
  });

  it("todos los productos tienen nombre, categoría y descripción no vacíos", () => {
    for (const p of productos) {
      expect(p.nombre.trim()).not.toBe("");
      expect(p.categoria.trim()).not.toBe("");
      expect(p.descripcion.trim()).not.toBe("");
    }
  });

  it("imagen es null o una ruta que apunta a ASSETS/Productos", () => {
    for (const p of productos) {
      if (p.imagen !== null) {
        expect(p.imagen).toMatch(/^ASSETS\/Productos\//);
      }
    }
  });

  it("los ids destacados existen en el catálogo", () => {
    for (const id of idsDestacados) {
      expect(productos.some((p) => p.id === id)).toBe(true);
    }
  });

  it("idsDestacados tiene 3 elementos (los que muestra el inicio)", () => {
    expect(idsDestacados).toHaveLength(3);
  });

  it("categorias deriva del catálogo sin duplicados", () => {
    expect(new Set(categorias).size).toBe(categorias.length);
    for (const c of categorias) {
      expect(productos.some((p) => p.categoria === c)).toBe(true);
    }
  });
});
