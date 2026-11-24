import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CartProvider } from "../context/CartContext.jsx";

/** Sembrar el carrito en localStorage antes de renderizar (misma clave que la app). */
export function seedCart(items) {
  localStorage.setItem("carrito", JSON.stringify(items));
}

/**
 * Sembrar una sesión en localStorage antes de renderizar.
 * AuthContext guarda la sesión completa bajo la clave "auth".
 */
export function seedAuth({
  nombre = "Tester",
  email = "test@ejemplo.cl",
  descuento = false,
  role = "CLIENTE",
  token = "token-test",
} = {}) {
  localStorage.setItem(
    "auth",
    JSON.stringify({
      token,
      usuario: { id: 1, nombre, email },
      role,
      descuentoActivo: descuento,
    })
  );
}

/**
 * Renderiza un componente con los providers reales de la app (Auth + Cart)
 * y un MemoryRouter en la ruta dada.
 * `path` permite declarar la ruta con parámetros, ej. "/productos/:id".
 */
export function renderPagina(elemento, { ruta = "/", path = "*" } = {}) {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[ruta]}>
          <Routes>
            <Route path={path} element={elemento} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
}

/** Un producto de prueba con todos los campos del catálogo real. */
export const productoDePrueba = {
  id: 99,
  nombre: "Producto Test",
  categoria: "Tests",
  precio: 1000,
  emoji: "🧪",
  imagen: null,
  descripcion: "Descripción de prueba",
};
