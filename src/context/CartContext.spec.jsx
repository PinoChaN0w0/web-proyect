import { act, renderHook } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext.jsx";

const A = { id: 1, nombre: "Catan", precio: 1000 };
const B = { id: 2, nombre: "Mouse", precio: 500 };

describe("CartContext", () => {
  beforeEach(() => localStorage.clear());
  const montar = () => renderHook(() => useCart(), { wrapper: CartProvider });

  it("agregar crea un ítem con cantidad 1 y repetirlo suma 1", () => {
    const { result } = montar();
    act(() => result.current.agregar(A));
    expect(result.current.items[0].cantidad).toBe(1);
    act(() => result.current.agregar(A));
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].cantidad).toBe(2);
  });

  it("calcula totalItems y subtotal", () => {
    const { result } = montar();
    act(() => {
      result.current.agregar(A);
      result.current.agregar(A);
      result.current.agregar(B);
    });
    expect(result.current.totalItems).toBe(3);
    expect(result.current.subtotal).toBe(2500);
  });

  it("restar elimina el ítem cuando llega a 0", () => {
    const { result } = montar();
    act(() => result.current.agregar(A));
    act(() => result.current.restar(1));
    expect(result.current.items.length).toBe(0);
  });

  it("eliminar y vaciar", () => {
    const { result } = montar();
    act(() => {
      result.current.agregar(A);
      result.current.agregar(B);
    });
    act(() => result.current.eliminar(1));
    expect(result.current.items.map((i) => i.id)).toEqual([2]);
    act(() => result.current.vaciar());
    expect(result.current.items).toEqual([]);
  });

  it("persiste en localStorage", () => {
    const { result } = montar();
    act(() => result.current.agregar(A));
    expect(JSON.parse(localStorage.getItem("carrito"))[0].id).toBe(1);
  });

  it("sumar incrementa la cantidad de un ítem existente", () => {
    const { result } = montar();
    act(() => result.current.agregar(A));
    act(() => result.current.sumar(1));
    act(() => result.current.sumar(1));
    expect(result.current.items[0].cantidad).toBe(3);
    expect(result.current.totalItems).toBe(3);
  });
});
