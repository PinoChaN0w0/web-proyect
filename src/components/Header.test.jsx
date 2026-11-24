import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CartProvider } from "../context/CartContext.jsx";
import Header from "./Header.jsx";
import { seedAuth, seedCart } from "../test/helpers.jsx";

function renderHeader(ruta = "/") {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[ruta]}>
          <Header />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
}

describe("Header", () => {
  it("muestra el logo que enlaza al inicio", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /level-up/i })).toHaveAttribute("href", "/");
  });

  it("muestra los 5 enlaces de navegación", () => {
    renderHeader();
    for (const texto of ["Inicio", "Productos", "Nosotros", "Blogs", "Contacto"]) {
      expect(screen.getByRole("link", { name: texto })).toBeInTheDocument();
    }
  });

  it("sin sesión muestra el enlace a iniciar sesión", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute("href", "/login");
  });

  it("con sesión muestra el nombre del usuario en vez del enlace de login", () => {
    seedAuth({ nombre: "Diego" });
    renderHeader();
    expect(screen.getByRole("button", { name: /diego/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /iniciar sesión/i })).not.toBeInTheDocument();
  });

  it("con sesión pero sin nombre muestra 'Mi cuenta' (caso borde)", () => {
    // sesión sin nombre: se escribe directo en "auth" porque seedAuth aplica un nombre por defecto
    localStorage.setItem(
      "auth",
      JSON.stringify({ token: "t", usuario: { email: "x@y.cl" }, role: "CLIENTE", descuentoActivo: false })
    );
    renderHeader();
    expect(screen.getByRole("button", { name: /mi cuenta/i })).toBeInTheDocument();
  });

  it("logout desde el header limpia la sesión", () => {
    seedAuth({ nombre: "Diego" });
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /diego/i }));
    expect(localStorage.getItem("auth")).toBeNull();
    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("muestra el contador del carrito con la cantidad total", () => {
    seedCart([
      { id: 1, nombre: "Catan", precio: 29990, cantidad: 2 },
      { id: 4, nombre: "Corsair", precio: 79990, cantidad: 3 },
    ]);
    renderHeader();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("el contador parte en 0 con el carrito vacío", () => {
    renderHeader();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("marca la ruta activa en el enlace del carrito", () => {
    renderHeader("/carrito");
    expect(screen.getByRole("link", { name: /cart-shopping|0/ })).toHaveClass("active");
  });

  it("un usuario admin ve los enlaces Admin y Usuarios", () => {
    seedAuth({ role: "ADMIN" });
    renderHeader();
    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: "Usuarios" })).toHaveAttribute("href", "/admin/usuarios");
  });

  it("un cliente no ve los enlaces de administración", () => {
    seedAuth({ role: "CLIENTE" });
    renderHeader();
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });
});
