import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../context/CartContext.jsx";
import Productos from "./Productos.jsx";

function renderProductos() {
  return render(
    <CartProvider>
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    </CartProvider>
  );
}

const grid = () => document.querySelector(".products-grid");
const nombresVisibles = () =>
  within(grid())
    .getAllByRole("article")
    .map((a) => within(a).getByRole("heading").textContent);

describe("Productos", () => {
  it("lista los 10 productos del catálogo al abrir", () => {
    renderProductos();
    expect(within(grid()).getAllByRole("article")).toHaveLength(10);
  });

  it("filtra por texto de búsqueda sin resultados ajenos", async () => {
    const usuario = userEvent.setup();
    renderProductos();
    await usuario.type(screen.getByLabelText("Buscar producto"), "catan");
    expect(nombresVisibles()).toEqual(["Catan"]);
  });

  it("la búsqueda ignora mayúsculas", async () => {
    const usuario = userEvent.setup();
    renderProductos();
    await usuario.type(screen.getByLabelText("Buscar producto"), "CORSair");
    expect(nombresVisibles()).toEqual(["Corsair HS80 Wireless"]);
  });

  it("filtra por categoría", async () => {
    const usuario = userEvent.setup();
    renderProductos();
    await usuario.selectOptions(screen.getByRole("combobox"), "Mouse");
    // "Mousepad" es una categoría distinta: solo el Logitech es "Mouse"
    expect(nombresVisibles()).toEqual(["Logitech G PRO SUPERLIGHT 2"]);
  });

  it("filtra por categoría Mousepad", async () => {
    const usuario = userEvent.setup();
    renderProductos();
    await usuario.selectOptions(screen.getByRole("combobox"), "Mousepad");
    expect(nombresVisibles()).toEqual(["Razer Goliathus"]);
  });

  it("combina búsqueda y categoría", async () => {
    const usuario = userEvent.setup();
    renderProductos();
    await usuario.selectOptions(screen.getByRole("combobox"), "Mouse");
    await usuario.type(screen.getByLabelText("Buscar producto"), "logitech");
    expect(nombresVisibles()).toEqual(["Logitech G PRO SUPERLIGHT 2"]);
  });

  it("caso borde: búsqueda sin coincurrencias muestra el mensaje de no resultados", async () => {
    const usuario = userEvent.setup();
    renderProductos();
    await usuario.type(screen.getByLabelText("Buscar producto"), "zzzznoexiste");
    expect(within(grid()).queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText("No encontramos productos")).toBeInTheDocument();
  });

  it("al limpiar la búsqueda vuelve a mostrar todo", async () => {
    const usuario = userEvent.setup();
    renderProductos();
    const input = screen.getByLabelText("Buscar producto");
    await usuario.type(input, "catan");
    await usuario.clear(input);
    expect(within(grid()).getAllByRole("article")).toHaveLength(10);
  });

  it("volver a 'Todas las categorías' elimina el filtro", async () => {
    const usuario = userEvent.setup();
    renderProductos();
    await usuario.selectOptions(screen.getByRole("combobox"), "Mouse");
    await usuario.selectOptions(screen.getByRole("combobox"), "todos");
    expect(within(grid()).getAllByRole("article")).toHaveLength(10);
  });
});
