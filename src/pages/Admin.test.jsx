import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { categorias, productos } from "../data/productos.js";
import Admin from "./Admin.jsx";

// El admin muta el módulo del catálogo en memoria: lo restauramos tras cada prueba.
const catalogoOriginal = [...productos];
const categoriasOriginales = [...categorias];

afterEach(() => {
  productos.splice(0, productos.length, ...catalogoOriginal);
  categorias.splice(0, categorias.length, ...categoriasOriginales);
});

function renderAdmin() {
  return render(<Admin />);
}

function entrarComoAdmin() {
  sessionStorage.setItem("adminOk", "true");
  renderAdmin();
}

function llenarFormulario({ nombre, categoria, precio, emoji = "", descripcion = "" }) {
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: nombre } });
  fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: categoria } });
  fireEvent.change(screen.getByLabelText(/Precio/), { target: { value: precio } });
  if (emoji) fireEvent.change(screen.getByLabelText("Emoji"), { target: { value: emoji } });
  if (descripcion) fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: descripcion } });
}

// submit directo al form: evita que la validación de HTML (min="1", required)
// bloquee el evento y así probamos la validación de la aplicación.
function enviarFormulario(boton = "GUARDAR") {
  fireEvent.submit(screen.getByRole("button", { name: boton }).closest("form"));
}

describe("Admin – control de acceso", () => {
  it("sin sesión de admin muestra el formulario de acceso", () => {
    renderAdmin();
    expect(screen.getByText("ACCESO ADMIN")).toBeInTheDocument();
    expect(screen.queryByText("ADMINISTRAR PRODUCTOS")).not.toBeInTheDocument();
  });

  it("rechaza credenciales incorrectas", () => {
    renderAdmin();
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "hacker@x.cl" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "adivina" } });
    fireEvent.click(screen.getByRole("button", { name: "ENTRAR" }));
    expect(screen.getByText("Error: credenciales de administrador incorrectas.")).toBeInTheDocument();
    expect(sessionStorage.getItem("adminOk")).toBeNull();
  });

  it("acepta las credenciales correctas y persiste la sesión en sessionStorage", () => {
    renderAdmin();
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: " admin@levelup.cl " } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: "ENTRAR" }));
    expect(screen.getByText("ADMINISTRAR PRODUCTOS")).toBeInTheDocument();
    expect(sessionStorage.getItem("adminOk")).toBe("true");
  });

  it("'Salir' limpia la sesión y vuelve al formulario de acceso", () => {
    entrarComoAdmin();
    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    expect(sessionStorage.getItem("adminOk")).toBeNull();
    expect(screen.getByText("ACCESO ADMIN")).toBeInTheDocument();
  });

  it("la sesión admin guardada da acceso directo al panel", () => {
    entrarComoAdmin();
    expect(screen.getByText("ADMINISTRAR PRODUCTOS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salir" })).toBeInTheDocument();
  });
});

describe("Admin – listado", () => {
  it("lista el catálogo completo con precio formateado", () => {
    entrarComoAdmin();
    const filas = screen.getAllByRole("row").slice(1);
    expect(filas).toHaveLength(productos.length);
    // Catan y Razer Goliathus cuestan $29.990: verificamos el de la fila de Catan
    expect(within(screen.getByRole("row", { name: /Catan/ })).getByText("$29.990 CLP")).toBeInTheDocument();
  });
});

describe("Admin – agregar productos", () => {
  it("valida que nombre y categoría sean obligatorios", () => {
    entrarComoAdmin();
    llenarFormulario({ nombre: "", categoria: "", precio: "100" });
    enviarFormulario();
    expect(screen.getByText("Error: nombre y categoría son obligatorios.")).toBeInTheDocument();
  });

  it("valida precio mayor a 0 (límite incluido)", () => {
    entrarComoAdmin();
    llenarFormulario({ nombre: "Prueba", categoria: "Tests", precio: "0" });
    enviarFormulario();
    expect(screen.getByText("Error: ingresa un precio mayor a 0.")).toBeInTheDocument();
  });

  it("agrega un producto: aparece en la tabla, en localStorage y en el catálogo", () => {
    entrarComoAdmin();
    llenarFormulario({ nombre: "Teclado Mecánico", categoria: "Accesorios", precio: "45990", descripcion: "Switch rojos." });
    enviarFormulario();

    expect(screen.getByRole("cell", { name: /Teclado Mecánico/ })).toBeInTheDocument();
    // productosTienda guarda el catálogo completo (incluye el producto nuevo)
    const guardados = JSON.parse(localStorage.getItem("productosTienda"));
    expect(guardados).toHaveLength(productos.length);
    expect(guardados).toContainEqual(
      expect.objectContaining({ nombre: "Teclado Mecánico", precio: 45990, id: expect.any(Number), imagen: null })
    );
    // el catálogo en memoria se actualiza para que la tienda lo muestre
    expect(productos.some((p) => p.nombre === "Teclado Mecánico")).toBe(true);
  });

  it("una categoría nueva se agrega al listado de categorías", () => {
    entrarComoAdmin();
    llenarFormulario({ nombre: "Producto Raro", categoria: "Nueva Categoría", precio: "100" });
    enviarFormulario();
    expect(categorias).toContain("Nueva Categoría");
  });

  it("el emoji por defecto es 🎮 y el formulario se limpia tras guardar", () => {
    entrarComoAdmin();
    llenarFormulario({ nombre: "Sin Emoji", categoria: "Tests", precio: "500" });
    enviarFormulario();
    const guardado = JSON.parse(localStorage.getItem("productosTienda")).find((p) => p.nombre === "Sin Emoji");
    expect(guardado.emoji).toBe("🎮");
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    // input[type=number] vacío se reporta como null en jest-dom
    expect(screen.getByLabelText(/Precio/)).toHaveValue(null);
  });
});

describe("Admin – editar y eliminar", () => {
  it("editar precarga el formulario y actualiza el producto", () => {
    entrarComoAdmin();
    const filaCatan = screen.getByRole("row", { name: /Catan/ });
    fireEvent.click(within(filaCatan).getByRole("button", { name: "Editar" }));

    expect(screen.getByLabelText("Nombre")).toHaveValue("Catan");
    expect(screen.getByLabelText(/Precio/)).toHaveValue(29990); // type=number se compara como número

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Catan Editado" } });
    enviarFormulario("ACTUALIZAR");

    expect(screen.getByRole("cell", { name: /Catan Editado/ })).toBeInTheDocument();
    expect(productos.find((p) => p.id === 1).nombre).toBe("Catan Editado");
    expect(JSON.parse(localStorage.getItem("productosTienda")).find((p) => p.id === 1).nombre).toBe("Catan Editado");
  });

  it("'Cancelar' sale del modo edición sin guardar cambios", () => {
    entrarComoAdmin();
    fireEvent.click(within(screen.getByRole("row", { name: /Catan/ })).getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "No Debe Guardarse" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(productos.find((p) => p.id === 1).nombre).toBe("Catan");
  });

  it("eliminar quita el producto con confirmación y lo refleja en el catálogo", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    entrarComoAdmin();
    fireEvent.click(within(screen.getByRole("row", { name: /Catan/ })).getByRole("button", { name: "Eliminar" }));
    expect(screen.queryByRole("row", { name: /Catan/ })).not.toBeInTheDocument();
    expect(productos.some((p) => p.id === 1)).toBe(false);
    expect(JSON.parse(localStorage.getItem("productosTienda")).some((p) => p.id === 1)).toBe(false);
  });

  it("cancelar la confirmación conserva el producto", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    entrarComoAdmin();
    fireEvent.click(within(screen.getByRole("row", { name: /Catan/ })).getByRole("button", { name: "Eliminar" }));
    expect(screen.getByRole("row", { name: /Catan/ })).toBeInTheDocument();
    expect(productos.some((p) => p.id === 1)).toBe(true);
  });
});
