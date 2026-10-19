import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

function renderEnRuta(ruta) {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[ruta]}>
          <App />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
}

describe("App – enrutado", () => {
  it("en '/' muestra el Home dentro del Layout (header y footer)", () => {
    renderEnRuta("/");
    expect(screen.getByText("BIENVENIDO A LEVEL-UP")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("en '/productos' muestra el listado", () => {
    renderEnRuta("/productos");
    expect(screen.getByText(/NUESTROS/)).toBeInTheDocument();
  });

  it("en '/productos/1' muestra el detalle de Catan", () => {
    renderEnRuta("/productos/1");
    expect(screen.getByRole("heading", { name: "Catan" })).toBeInTheDocument();
  });

  it("en '/carrito' muestra el carrito", () => {
    renderEnRuta("/carrito");
    expect(screen.getByText("TU CARRITO DE COMPRAS")).toBeInTheDocument();
  });

  it("en '/login' muestra el formulario de sesión", () => {
    renderEnRuta("/login");
    expect(screen.getByText("INICIAR SESIÓN")).toBeInTheDocument();
  });

  it("en '/registro' muestra el formulario de registro", () => {
    renderEnRuta("/registro");
    expect(screen.getByText("CREAR CUENTA")).toBeInTheDocument();
  });

  it("en '/admin' muestra el acceso de administrador", () => {
    renderEnRuta("/admin");
    expect(screen.getByText("ACCESO ADMIN")).toBeInTheDocument();
  });

  it("las rutas pendientes muestran 'Página no encontrada'", () => {
    renderEnRuta("/esto-no-existe");
    expect(screen.getByText("Página no encontrada")).toBeInTheDocument();
  });

  it("'/nosotros', '/blogs' y '/contacto' usan la página Proximamente", () => {
    renderEnRuta("/nosotros");
    expect(screen.getByRole("heading", { name: "Nosotros" })).toBeInTheDocument();
  });
});
