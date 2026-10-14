import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "carrito"; // misma clave que el sitio estático

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(leerCarrito);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const agregar = useCallback((producto) => {
    setItems((prev) =>
      prev.some((i) => i.id === producto.id)
        ? prev.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [...prev, { ...producto, cantidad: 1 }]
    );
  }, []);

  const sumar = useCallback((id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i)));
  }, []);

  const restar = useCallback((id) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i];
        return i.cantidad > 1 ? [{ ...i, cantidad: i.cantidad - 1 }] : [];
      })
    );
  }, []);

  const eliminar = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => items.reduce((acc, i) => acc + i.cantidad, 0), [items]);
  const subtotal = useMemo(() => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0), [items]);

  const value = { items, totalItems, subtotal, agregar, sumar, restar, eliminar, vaciar };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
