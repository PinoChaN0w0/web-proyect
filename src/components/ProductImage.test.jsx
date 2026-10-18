import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ProductImage from "./ProductImage.jsx";

const conImagen = { id: 1, nombre: "Catan", emoji: "🎲", imagen: "ASSETS/Productos/catan.jpg" };
const sinImagen = { id: 3, nombre: "XBOX Controller", emoji: "🎮", imagen: null };
const imagenVacia = { id: 9, nombre: "Razer Goliathus", emoji: "⬛", imagen: "" };
const sinEmoji = { id: 50, nombre: "Sin Emoji", emoji: "", imagen: null };

describe("ProductImage", () => {
  it("muestra la imagen con BASE_URL prefijada cuando hay ruta", () => {
    render(<ProductImage producto={conImagen} />);
    const img = screen.getByAltText("Catan");
    expect(img).toHaveAttribute("src", "/ASSETS/Productos/catan.jpg");
  });

  it("muestra el emoji cuando imagen es null", () => {
    render(<ProductImage producto={sinImagen} />);
    expect(screen.queryByAltText("XBOX Controller")).not.toBeInTheDocument();
    expect(screen.getByText("🎮")).toBeInTheDocument();
  });

  it("caso borde: imagen en cadena vacía también cae al emoji", () => {
    render(<ProductImage producto={imagenVacia} />);
    expect(screen.getByText("⬛")).toBeInTheDocument();
  });

  it("caso borde: sin emoji propio usa 🎮 por defecto", () => {
    render(<ProductImage producto={sinEmoji} />);
    expect(screen.getByText("🎮")).toBeInTheDocument();
  });

  it("cae al emoji si la imagen falla al cargar (onError)", () => {
    render(<ProductImage producto={conImagen} />);
    fireEvent.error(screen.getByAltText("Catan"));
    expect(screen.queryByAltText("Catan")).not.toBeInTheDocument();
    expect(screen.getByText("🎲")).toBeInTheDocument();
  });

  it("variante 'thumb' no usa la clase product-image y usa estilos de miniatura", () => {
    render(<ProductImage producto={conImagen} variant="thumb" />);
    const contenedor = screen.getByAltText("Catan").parentElement;
    expect(contenedor).not.toHaveClass("product-image");
    expect(contenedor.style.width).toBe("60px");
  });

  it("variante 'card' (por defecto) usa la clase product-image", () => {
    render(<ProductImage producto={conImagen} />);
    expect(screen.getByAltText("Catan").parentElement).toHaveClass("product-image");
  });
});
