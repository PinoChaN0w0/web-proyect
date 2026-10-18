import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../context/CartContext.jsx";
import Home from "./Home.jsx";

function renderHome() {
  return render(
    <CartProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </CartProvider>
  );
}

describe("Home", () => {
  it("muestra el hero con el mensaje de bienvenida", () => {
    renderHome();
    expect(screen.getByText("BIENVENIDO A LEVEL-UP")).toBeInTheDocument();
    expect(screen.getByText(/conoces productos|Buscas productos de calidad/i)).toBeInTheDocument();
  });

  it("el botón del hero enlaza a /productos", () => {
    renderHome();
    expect(screen.getByRole("link", { name: /ver productos/i })).toHaveAttribute("href", "/productos");
  });

  it("muestra exactamente los 3 productos destacados del catálogo", () => {
    renderHome();
    const grid = document.querySelector(".products-grid");
    const tarjetas = within(grid).getAllByRole("article");
    expect(tarjetas).toHaveLength(3);
    // idsDestacados = [5, 8, 4] => PlayStation 5, Logitech G PRO SUPERLIGHT 2, Corsair HS80
    expect(screen.getByRole("heading", { name: "PlayStation 5" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Logitech G PRO SUPERLIGHT 2" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Corsair HS80 Wireless" })).toBeInTheDocument();
  });

  it("los destacados se muestran en modo compacto (sin descripción)", () => {
    renderHome();
    expect(screen.queryByText(/Consola de nueva generación/)).not.toBeInTheDocument();
  });

  it("muestra la sección About con enlace a /nosotros", () => {
    renderHome();
    expect(screen.getByText("MÁS QUE UNA TIENDA,")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /conócenos/i })).toHaveAttribute("href", "/nosotros");
  });
});
