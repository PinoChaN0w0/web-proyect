import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext.jsx";
import { seedCart } from "../test/helpers.jsx";

const producto = { id: 1, nombre: "Catan", categoria: "Juegos de mesa", precio: 29990, emoji: "🎲" };
const otro = { id: 4, nombre: "Corsair HS80", categoria: "Accesorios", precio: 79990, emoji: "🎧" };

let ctx = null;

function Captura() {
  ctx = useCart();
  return null;
}

function montar() {
  render(
    <CartProvider>
      <Captura />
    </CartProvider>
  );
}

describe("CartContext", () => {
  it("parte con el carrito vacío cuando no hay nada en localStorage", () => {
    montar();
    expect(ctx.items).toEqual([]);
    expect(ctx.totalItems).toBe(0);
    expect(ctx.subtotal).toBe(0);
  });

  it("agregar un producto crea un ítem con cantidad 1", () => {
    montar();
    act(() => ctx.agregar(producto));
    expect(ctx.items).toHaveLength(1);
    expect(ctx.items[0]).toEqual({ ...producto, cantidad: 1 });
    expect(ctx.totalItems).toBe(1);
  });

  it("agregar el mismo producto dos veces incrementa cantidad, no duplica la fila", () => {
    montar();
    act(() => {
      ctx.agregar(producto);
      ctx.agregar(producto);
    });
    expect(ctx.items).toHaveLength(1);
    expect(ctx.items[0].cantidad).toBe(2);
    expect(ctx.totalItems).toBe(2);
  });

  it("agregar productos distintos crea filas separadas y suma subtotal", () => {
    montar();
    act(() => {
      ctx.agregar(producto);
      ctx.agregar(otro);
    });
    expect(ctx.items).toHaveLength(2);
    expect(ctx.subtotal).toBe(29990 + 79990);
  });

  it("sumar incrementa la cantidad del producto indicado", () => {
    montar();
    act(() => {
      ctx.agregar(producto);
      ctx.sumar(1);
    });
    expect(ctx.items[0].cantidad).toBe(2);
  });

  it("restar decrementa hasta 1 y elimina la fila al llegar a 0", () => {
    montar();
    act(() => {
      ctx.agregar(producto);
      ctx.agregar(producto); // cantidad 2
      ctx.restar(1); // vuelve a 1
    });
    expect(ctx.items).toHaveLength(1);
    expect(ctx.items[0].cantidad).toBe(1);
    act(() => ctx.restar(1)); // al llegar a 0 se elimina
    expect(ctx.items).toHaveLength(0);
  });

  it("restar un id inexistente no modifica el carrito", () => {
    montar();
    act(() => {
      ctx.agregar(producto);
      ctx.restar(999);
    });
    expect(ctx.items).toHaveLength(1);
  });

  it("eliminar quita solo el producto indicado", () => {
    montar();
    act(() => {
      ctx.agregar(producto);
      ctx.agregar(otro);
      ctx.eliminar(1);
    });
    expect(ctx.items).toHaveLength(1);
    expect(ctx.items[0].id).toBe(4);
  });

  it("vaciar deja el carrito vacío", () => {
    montar();
    act(() => {
      ctx.agregar(producto);
      ctx.agregar(otro);
      ctx.vaciar();
    });
    expect(ctx.items).toHaveLength(0);
    expect(ctx.totalItems).toBe(0);
    expect(ctx.subtotal).toBe(0);
  });

  it("persiste el carrito en localStorage con la clave 'carrito'", () => {
    montar();
    act(() => ctx.agregar(producto));
    expect(JSON.parse(localStorage.getItem("carrito"))).toEqual([{ ...producto, cantidad: 1 }]);
  });

  it("lee un carrito preexistente en localStorage al iniciar", () => {
    seedCart([{ ...otro, cantidad: 3 }]);
    montar();
    expect(ctx.totalItems).toBe(3);
    expect(ctx.subtotal).toBe(79990 * 3);
  });

  it("caso de error: JSON corrupto en localStorage se trata como carrito vacío", () => {
    localStorage.setItem("carrito", "{esto no es json");
    montar();
    expect(ctx.items).toEqual([]);
  });

  it("caso borde: localStorage con 'null' string se trata como vacío", () => {
    localStorage.setItem("carrito", "null");
    montar();
    expect(ctx.items).toEqual([]);
  });

  it("lanza un error claro al usar useCart fuera del provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Captura />)).toThrow("useCart debe usarse dentro de <CartProvider>");
    consoleSpy.mockRestore();
  });
});
