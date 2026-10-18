import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../context/CartContext.jsx";
import ProductCard from "./ProductCard.jsx";
import { seedCart } from "../test/helpers.jsx";

const producto = {
  id: 1,
  nombre: "Catan",
  categoria: "Juegos de mesa",
  precio: 29990,
  emoji: "🎲",
  imagen: null,
  descripcion: "Juego de estrategia y aventura.",
};

function renderCard(props = {}) {
  return render(
    <CartProvider>
      <MemoryRouter>
        <ProductCard producto={producto} {...props} />
      </MemoryRouter>
    </CartProvider>
  );
}

describe("ProductCard", () => {
  it("muestra nombre, categoría, precio y descripción", () => {
    renderCard();
    expect(screen.getByRole("heading", { name: "Catan" })).toBeInTheDocument();
    expect(screen.getByText("Juegos de mesa")).toBeInTheDocument();
    expect(screen.getByText("$29.990 CLP")).toBeInTheDocument();
    expect(screen.getByText("Juego de estrategia y aventura.")).toBeInTheDocument();
  });

  it("enlaza al detalle del producto", () => {
    renderCard();
    const link = screen.getByRole("link", { name: /ver producto/i });
    expect(link).toHaveAttribute("href", "/productos/1");
  });

  it("modo normal muestra el botón Agregar", () => {
    renderCard();
    expect(screen.getByRole("button", { name: /agregar/i })).toBeInTheDocument();
  });

  it("modo compacto oculta la descripción y el botón Agregar", () => {
    renderCard({ compacto: true });
    expect(screen.queryByText("Juego de estrategia y aventura.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /agregar/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver producto/i })).toBeInTheDocument();
  });

  it("al agregar: guarda en el carrito y muestra alert con el nombre", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: /agregar/i }));
    expect(JSON.parse(localStorage.getItem("carrito"))).toEqual([{ ...producto, cantidad: 1 }]);
    expect(alertSpy).toHaveBeenCalledWith("Catan fue agregado al carrito.");
  });

  it("al agregar dos veces incrementa la cantidad en el carrito", () => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
    renderCard();
    const boton = screen.getByRole("button", { name: /agregar/i });
    fireEvent.click(boton);
    fireEvent.click(boton);
    expect(JSON.parse(localStorage.getItem("carrito"))[0].cantidad).toBe(2);
  });

  it("respeta el carrito ya existente en localStorage", () => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
    seedCart([{ ...producto, cantidad: 5 }]);
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: /agregar/i }));
    expect(JSON.parse(localStorage.getItem("carrito"))[0].cantidad).toBe(6);
  });
});
