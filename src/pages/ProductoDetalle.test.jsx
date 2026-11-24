import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import ProductoDetalle from "./ProductoDetalle.jsx";
import { renderPagina } from "../test/helpers.jsx";
import { productos } from "../data/productos.js";
import { api } from "../api/client.js";

// El detalle ahora pide el producto al backend (api.getProduct) y muestra "Cargando..." primero.
vi.mock("../api/client.js", () => ({
  api: { getProduct: vi.fn(), login: vi.fn(), register: vi.fn() },
  setToken: vi.fn(),
  getToken: vi.fn(),
}));

function renderDetalle(ruta) {
  return renderPagina(<ProductoDetalle />, { ruta, path: "/productos/:id" });
}

beforeEach(() => {
  api.getProduct.mockReset();
  // simula el backend: busca en el catálogo local y responde 404 si no existe
  api.getProduct.mockImplementation(async (id) => {
    const p = productos.find((x) => String(x.id) === String(id));
    if (p) return p;
    const e = new Error("Not found");
    e.status = 404;
    throw e;
  });
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

describe("ProductoDetalle", () => {
  it("muestra los datos del producto encontrado", async () => {
    renderDetalle("/productos/1");
    expect(await screen.findByRole("heading", { name: "Catan" })).toBeInTheDocument();
    expect(screen.getByText("Juegos de mesa")).toBeInTheDocument();
    expect(screen.getByText("$29.990 CLP")).toBeInTheDocument();
    expect(screen.getByText(/Juego de estrategia y aventura/)).toBeInTheDocument();
  });

  it("muestra la imagen del producto cuando existe", async () => {
    renderDetalle("/productos/1");
    expect(await screen.findByAltText("Catan")).toHaveAttribute("src", "/ASSETS/Productos/catan.jpg");
  });

  it("agrega el producto al carrito al presionar el botón", async () => {
    renderDetalle("/productos/1");
    fireEvent.click(await screen.findByRole("button", { name: /agregar al carrito/i }));
    expect(JSON.parse(localStorage.getItem("carrito"))).toMatchObject([{ id: 1, cantidad: 1 }]);
  });

  it("caso de error: id inexistente muestra 'Producto no encontrado'", async () => {
    renderDetalle("/productos/99999");
    expect(await screen.findByText("Producto no encontrado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver a productos/i })).toHaveAttribute("href", "/productos");
  });

  it("caso borde: id no numérico también muestra 'Producto no encontrado'", async () => {
    renderDetalle("/productos/abc");
    expect(await screen.findByText("Producto no encontrado")).toBeInTheDocument();
  });

  it("producto con imagen null muestra el emoji en el detalle", async () => {
    renderDetalle("/productos/3"); // XBOX Controller (imagen: null)
    expect(await screen.findByRole("heading", { name: "XBOX Controller" })).toBeInTheDocument();
    expect(screen.getByText("🎮")).toBeInTheDocument();
  });

  it("muestra el mensaje del backend si falla con un error distinto de 404", async () => {
    api.getProduct.mockRejectedValue(new Error("Error HTTP 500"));
    renderDetalle("/productos/1");
    expect(await screen.findByText("Error HTTP 500")).toBeInTheDocument();
  });
});
