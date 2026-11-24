import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Admin from "./Admin.jsx";
import { productos } from "../data/productos.js";
import { api } from "../api/client.js";

// El panel ya no usa localStorage ni login propio (el acceso lo protege <ProtectedRoute admin>):
// ahora lista y modifica productos a través del backend.
vi.mock("../api/client.js", () => ({
  api: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
  setToken: vi.fn(),
  getToken: vi.fn(),
}));

// Renderiza y espera a que la tabla termine de cargar.
async function renderAdmin() {
  render(<Admin />);
  await screen.findByRole("row", { name: /Catan/ });
}

function llenarFormulario({ nombre, categoria, precio, emoji = "", descripcion = "" }) {
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: nombre } });
  fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: categoria } });
  fireEvent.change(screen.getByLabelText(/Precio/), { target: { value: precio } });
  if (emoji) fireEvent.change(screen.getByLabelText("Emoji"), { target: { value: emoji } });
  if (descripcion) fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: descripcion } });
}

// submit directo al form: evita que la validación de HTML (min="1")
// bloquee el evento y así probamos la validación de la aplicación.
function enviarFormulario(boton = "GUARDAR") {
  fireEvent.submit(screen.getByRole("button", { name: boton }).closest("form"));
}

const filaCatan = () => screen.getByRole("row", { name: /Catan/ });

beforeEach(() => {
  api.getProducts.mockReset().mockResolvedValue(productos);
  api.createProduct.mockReset().mockResolvedValue({});
  api.updateProduct.mockReset().mockResolvedValue({});
  api.deleteProduct.mockReset().mockResolvedValue({});
});

describe("Admin – listado", () => {
  it("lista el catálogo completo con precio formateado", async () => {
    await renderAdmin();
    expect(screen.getAllByRole("row").slice(1)).toHaveLength(productos.length);
    // Catan y Razer Goliathus cuestan $29.990: verificamos el de la fila de Catan
    expect(within(filaCatan()).getByText("$29.990 CLP")).toBeInTheDocument();
  });

  it("muestra el error si el backend no responde", async () => {
    api.getProducts.mockRejectedValue(new Error("No se pudieron cargar los productos."));
    render(<Admin />);
    expect(await screen.findByText("No se pudieron cargar los productos.")).toBeInTheDocument();
  });
});

describe("Admin – agregar productos", () => {
  it("valida que nombre y categoría sean obligatorios", async () => {
    await renderAdmin();
    llenarFormulario({ nombre: "", categoria: "", precio: "100" });
    enviarFormulario();
    expect(await screen.findByText("Error: nombre y categoría son obligatorios.")).toBeInTheDocument();
    expect(api.createProduct).not.toHaveBeenCalled();
  });

  it("valida precio mayor a 0 (límite incluido)", async () => {
    await renderAdmin();
    llenarFormulario({ nombre: "Prueba", categoria: "Tests", precio: "0" });
    enviarFormulario();
    expect(await screen.findByText("Error: ingresa un precio mayor a 0.")).toBeInTheDocument();
    expect(api.createProduct).not.toHaveBeenCalled();
  });

  it("crea el producto vía API, muestra el mensaje y recarga la lista", async () => {
    await renderAdmin();
    llenarFormulario({ nombre: "Teclado Mecánico", categoria: "Accesorios", precio: "45990", descripcion: "Switch rojos." });
    enviarFormulario();

    expect(await screen.findByText("Producto creado correctamente.")).toBeInTheDocument();
    expect(api.createProduct).toHaveBeenCalledWith({
      nombre: "Teclado Mecánico",
      categoria: "Accesorios",
      precio: 45990,
      emoji: "🎮", // emoji por defecto
      imagen: null, // imagen vacía => null
      descripcion: "Switch rojos.",
    });
    expect(api.getProducts).toHaveBeenCalledTimes(2); // carga inicial + recarga
  });

  it("el formulario se limpia tras guardar", async () => {
    await renderAdmin();
    llenarFormulario({ nombre: "Sin Emoji", categoria: "Tests", precio: "500" });
    enviarFormulario();
    await screen.findByText("Producto creado correctamente.");
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    // input[type=number] vacío se reporta como null en jest-dom
    expect(screen.getByLabelText(/Precio/)).toHaveValue(null);
  });

  it("muestra el error del backend si falla la creación", async () => {
    api.createProduct.mockRejectedValue(new Error("Error HTTP 500"));
    await renderAdmin();
    llenarFormulario({ nombre: "Falla", categoria: "Tests", precio: "100" });
    enviarFormulario();
    expect(await screen.findByText("Error HTTP 500")).toBeInTheDocument();
  });
});

describe("Admin – editar y eliminar", () => {
  it("editar precarga el formulario y actualiza el producto vía API", async () => {
    await renderAdmin();
    fireEvent.click(within(filaCatan()).getByRole("button", { name: "Editar" }));

    expect(screen.getByText("Editar producto")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Catan");
    expect(screen.getByLabelText(/Precio/)).toHaveValue(29990); // type=number se compara como número

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Catan Editado" } });
    enviarFormulario("ACTUALIZAR");

    expect(await screen.findByText("Producto actualizado correctamente.")).toBeInTheDocument();
    expect(api.updateProduct).toHaveBeenCalledWith(1, expect.objectContaining({ nombre: "Catan Editado", precio: 29990 }));
  });

  it("'Cancelar' sale del modo edición sin guardar cambios", async () => {
    await renderAdmin();
    fireEvent.click(within(filaCatan()).getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "No Debe Guardarse" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(api.updateProduct).not.toHaveBeenCalled();
  });

  it("eliminar pide confirmación y borra el producto vía API", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await renderAdmin();
    fireEvent.click(within(filaCatan()).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(api.deleteProduct).toHaveBeenCalledWith(1));
    expect(await screen.findByText("Producto eliminado.")).toBeInTheDocument();
  });

  it("cancelar la confirmación conserva el producto", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    await renderAdmin();
    fireEvent.click(within(filaCatan()).getByRole("button", { name: "Eliminar" }));
    expect(api.deleteProduct).not.toHaveBeenCalled();
    expect(filaCatan()).toBeInTheDocument();
  });

  it("muestra el error del backend si falla el borrado", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.deleteProduct.mockRejectedValue(new Error("Error HTTP 403"));
    await renderAdmin();
    fireEvent.click(within(filaCatan()).getByRole("button", { name: "Eliminar" }));
    expect(await screen.findByText("Error HTTP 403")).toBeInTheDocument();
  });
});
