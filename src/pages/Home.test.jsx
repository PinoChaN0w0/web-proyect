import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../context/CartContext.jsx";
import Home from "./Home.jsx";
import { productos } from "../data/productos.js";
import { api } from "../api/client.js";

// Los destacados vienen del backend (api.getProducts), de forma asíncrona.
vi.mock("../api/client.js", () => ({
  api: { getProducts: vi.fn() },
  setToken: vi.fn(),
  getToken: vi.fn(),
}));

// Renderiza y espera a que termine la carga de productos.
async function renderHome() {
  render(
    <CartProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </CartProvider>
  );
  await screen.findAllByRole("article");
}

beforeEach(() => {
  api.getProducts.mockReset();
  api.getProducts.mockResolvedValue(productos);
});

describe("Home", () => {
  it("muestra el hero con el mensaje de bienvenida", async () => {
    await renderHome();
    expect(screen.getByText("BIENVENIDO A LEVEL-UP")).toBeInTheDocument();
    expect(screen.getByText(/Buscas productos de calidad/i)).toBeInTheDocument();
  });

  it("el botón del hero enlaza a /productos", async () => {
    await renderHome();
    expect(screen.getByRole("link", { name: /ver productos/i })).toHaveAttribute("href", "/productos");
  });

  it("muestra exactamente los 3 productos destacados del catálogo", async () => {
    await renderHome();
    const grid = document.querySelector(".products-grid");
    expect(within(grid).getAllByRole("article")).toHaveLength(3);
    // IDS_DESTACADOS = [5, 8, 4] => PlayStation 5, Logitech G PRO SUPERLIGHT 2, Corsair HS80
    expect(screen.getByRole("heading", { name: "PlayStation 5" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Logitech G PRO SUPERLIGHT 2" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Corsair HS80 Wireless" })).toBeInTheDocument();
  });

  it("los destacados se muestran en modo compacto (sin descripción)", async () => {
    await renderHome();
    expect(screen.queryByText(/Consola de nueva generación/)).not.toBeInTheDocument();
  });

  it("muestra la sección About con enlace a /nosotros", async () => {
    await renderHome();
    expect(screen.getByText("MÁS QUE UNA TIENDA,")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /conócenos/i })).toHaveAttribute("href", "/nosotros");
  });

  it("muestra el error si el backend falla", async () => {
    api.getProducts.mockRejectedValue(new Error("No se pudieron cargar los productos."));
    render(
      <CartProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </CartProvider>
    );
    expect(await screen.findByText("No se pudieron cargar los productos.")).toBeInTheDocument();
  });
});
