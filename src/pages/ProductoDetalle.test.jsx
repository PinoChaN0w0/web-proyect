import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ProductoDetalle from "./ProductoDetalle.jsx";
import { renderPagina } from "../test/helpers.jsx";

function renderDetalle(ruta) {
  return renderPagina(<ProductoDetalle />, { ruta, path: "/productos/:id" });
}

describe("ProductoDetalle", () => {
  it("muestra los datos del producto encontrado", () => {
    renderDetalle("/productos/1");
    expect(screen.getByRole("heading", { name: "Catan" })).toBeInTheDocument();
    expect(screen.getByText("Juegos de mesa")).toBeInTheDocument();
    expect(screen.getByText("$29.990 CLP")).toBeInTheDocument();
    expect(screen.getByText(/Juego de estrategia y aventura/)).toBeInTheDocument();
  });

  it("muestra la imagen del producto cuando existe", () => {
    renderDetalle("/productos/1");
    expect(screen.getByAltText("Catan")).toHaveAttribute("src", "/ASSETS/Productos/catan.jpg");
  });

  it("agrega el producto al carrito al presionar el botón", () => {
    renderDetalle("/productos/1");
    fireEvent.click(screen.getByRole("button", { name: /agregar al carrito/i }));
    expect(JSON.parse(localStorage.getItem("carrito"))).toMatchObject([{ id: 1, cantidad: 1 }]);
  });

  it("caso de error: id inexistente muestra 'Producto no encontrado'", () => {
    renderDetalle("/productos/99999");
    expect(screen.getByText("Producto no encontrado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver a productos/i })).toHaveAttribute("href", "/productos");
  });

  it("caso borde: id no numérico también muestra 'Producto no encontrado'", () => {
    renderDetalle("/productos/abc");
    expect(screen.getByText("Producto no encontrado")).toBeInTheDocument();
  });

  it("producto con imagen null muestra el emoji en el detalle", () => {
    renderDetalle("/productos/3"); // XBOX Controller (imagen: null)
    expect(screen.getByRole("heading", { name: "XBOX Controller" })).toBeInTheDocument();
    expect(screen.getByText("🎮")).toBeInTheDocument();
  });
});
