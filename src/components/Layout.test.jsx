import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CartProvider } from "../context/CartContext.jsx";
import Layout from "./Layout.jsx";

function renderLayout(ruta = "/") {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[ruta]}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<h1>Inicio Contenido</h1>} />
              <Route path="carrito" element={<h1>Carrito Contenido</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
}

describe("Layout", () => {
  it("renderiza el header, el contenido de la ruta y el footer", () => {
    renderLayout();
    expect(screen.getByRole("banner")).toBeInTheDocument(); // header
    expect(screen.getByRole("heading", { name: "Inicio Contenido" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // footer
  });

  it("al montar hace scroll al inicio de la página", () => {
    renderLayout();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("vuelve a hacer scroll al cambiar de ruta", () => {
    const { container } = renderLayout();
    window.scrollTo.mockClear();
    fireEvent.click(container.querySelector('a[href="/carrito"]'));
    expect(screen.getByRole("heading", { name: "Carrito Contenido" })).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
