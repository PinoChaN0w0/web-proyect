import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../context/CartContext.jsx";
import Productos from "./Productos.jsx";
import { productos } from "../data/productos.js";
import { api } from "../api/client.js";

// El listado ahora viene del backend (api.getProducts), de forma asíncrona.
vi.mock("../api/client.js", () => ({
  api: { getProducts: vi.fn() },
  setToken: vi.fn(),
  getToken: vi.fn(),
}));

// Renderiza y espera a que termine la carga (aparecen los <article>).
async function renderProductos() {
  render(
    <CartProvider>
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    </CartProvider>
  );
  await screen.findAllByRole("article");
}

const grid = () => document.querySelector(".products-grid");
const nombresVisibles = () =>
  within(grid())
    .getAllByRole("article")
    .map((a) => within(a).getByRole("heading").textContent);

beforeEach(() => {
  api.getProducts.mockReset();
  api.getProducts.mockResolvedValue(productos);
});

describe("Productos", () => {
  it("lista los 10 productos del catálogo al abrir", async () => {
    await renderProductos();
    expect(within(grid()).getAllByRole("article")).toHaveLength(10);
  });

  it("filtra por texto de búsqueda sin resultados ajenos", async () => {
    const usuario = userEvent.setup();
    await renderProductos();
    await usuario.type(screen.getByLabelText("Buscar producto"), "catan");
    expect(nombresVisibles()).toEqual(["Catan"]);
  });

  it("la búsqueda ignora mayúsculas", async () => {
    const usuario = userEvent.setup();
    await renderProductos();
    await usuario.type(screen.getByLabelText("Buscar producto"), "CORSair");
    expect(nombresVisibles()).toEqual(["Corsair HS80 Wireless"]);
  });

  it("filtra por categoría", async () => {
    const usuario = userEvent.setup();
    await renderProductos();
    await usuario.selectOptions(screen.getByRole("combobox"), "Mouse");
    // "Mousepad" es una categoría distinta: solo el Logitech es "Mouse"
    expect(nombresVisibles()).toEqual(["Logitech G PRO SUPERLIGHT 2"]);
  });

  it("filtra por categoría Mousepad", async () => {
    const usuario = userEvent.setup();
    await renderProductos();
    await usuario.selectOptions(screen.getByRole("combobox"), "Mousepad");
    expect(nombresVisibles()).toEqual(["Razer Goliathus"]);
  });

  it("combina búsqueda y categoría", async () => {
    const usuario = userEvent.setup();
    await renderProductos();
    await usuario.selectOptions(screen.getByRole("combobox"), "Mouse");
    await usuario.type(screen.getByLabelText("Buscar producto"), "logitech");
    expect(nombresVisibles()).toEqual(["Logitech G PRO SUPERLIGHT 2"]);
  });

  it("caso borde: búsqueda sin coincidencias muestra el mensaje de no resultados", async () => {
    const usuario = userEvent.setup();
    await renderProductos();
    await usuario.type(screen.getByLabelText("Buscar producto"), "zzzznoexiste");
    expect(within(grid()).queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText("No encontramos productos")).toBeInTheDocument();
  });

  it("al limpiar la búsqueda vuelve a mostrar todo", async () => {
    const usuario = userEvent.setup();
    await renderProductos();
    const input = screen.getByLabelText("Buscar producto");
    await usuario.type(input, "catan");
    await usuario.clear(input);
    expect(within(grid()).getAllByRole("article")).toHaveLength(10);
  });

  it("volver a 'Todas las categorías' elimina el filtro", async () => {
    const usuario = userEvent.setup();
    await renderProductos();
    await usuario.selectOptions(screen.getByRole("combobox"), "Mouse");
    await usuario.selectOptions(screen.getByRole("combobox"), "todos");
    expect(within(grid()).getAllByRole("article")).toHaveLength(10);
  });

  it("muestra el error si el backend falla", async () => {
    api.getProducts.mockRejectedValue(new Error("No se pudieron cargar los productos."));
    render(
      <CartProvider>
        <MemoryRouter>
          <Productos />
        </MemoryRouter>
      </CartProvider>
    );
    expect(await screen.findByText("No se pudieron cargar los productos.")).toBeInTheDocument();
  });
});
