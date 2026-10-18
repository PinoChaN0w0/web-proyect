import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CartProvider } from "../context/CartContext.jsx";
import Carrito from "./Carrito.jsx";
import { seedAuth, seedCart } from "../test/helpers.jsx";

const catan = { id: 1, nombre: "Catan", categoria: "Juegos de mesa", precio: 1000, emoji: "🎲", imagen: null };
const corsair = { id: 4, nombre: "Corsair HS80", categoria: "Accesorios", precio: 2500, emoji: "🎧", imagen: null };

function renderCarrito() {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={["/carrito"]}>
          <Carrito />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
}

const carritoGuardado = () => JSON.parse(localStorage.getItem("carrito")) ?? [];

describe("Carrito – estado vacío", () => {
  it("muestra el mensaje de carrito vacío", () => {
    renderCarrito();
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("el enlace a la tienda apunta a /productos", () => {
    renderCarrito();
    expect(screen.getByRole("link", { name: /ir a la tienda/i })).toHaveAttribute("href", "/productos");
  });

  it("muestra subtotal y total en $0 CLP", () => {
    renderCarrito();
    // "$0 CLP" aparece en subtotal y total; el descuento se muestra como "-$0 CLP"
    expect(screen.getAllByText("$0 CLP")).toHaveLength(2);
    expect(screen.getByText("-$0 CLP")).toBeInTheDocument();
  });
});

describe("Carrito – con productos", () => {
  it("lista cada producto con su cantidad y subtotal por línea", () => {
    seedCart([
      { ...catan, cantidad: 2 },
      { ...corsair, cantidad: 1 },
    ]);
    renderCarrito();
    expect(screen.getByText("Catan")).toBeInTheDocument();
    expect(screen.getByText("Corsair HS80")).toBeInTheDocument();
    // subtotal de línea Catan (1000 x 2): la celda de línea no incluye " CLP"
    expect(screen.getByText("$2.000")).toBeInTheDocument();
    // precio unitario y subtotal de línea del Corsair (2500 x 1) coinciden
    expect(screen.getAllByText("$2.500")).toHaveLength(2);
    // subtotal y total generales del carrito
    expect(screen.getAllByText("$4.500 CLP")).toHaveLength(2);
  });

  it("'sumar uno' incrementa la cantidad y persiste en localStorage", () => {
    seedCart([{ ...catan, cantidad: 1 }]);
    renderCarrito();
    fireEvent.click(screen.getByRole("button", { name: "Sumar uno" }));
    expect(carritoGuardado()[0].cantidad).toBe(2);
  });

  it("'restar uno' decrementa la cantidad", () => {
    seedCart([{ ...catan, cantidad: 3 }]);
    renderCarrito();
    fireEvent.click(screen.getByRole("button", { name: "Restar uno" }));
    expect(carritoGuardado()[0].cantidad).toBe(2);
  });

  it("límite: restar en cantidad 1 elimina el producto", () => {
    seedCart([{ ...catan, cantidad: 1 }]);
    renderCarrito();
    fireEvent.click(screen.getByRole("button", { name: "Restar uno" }));
    expect(carritoGuardado()).toHaveLength(0);
  });

  it("'Eliminar' quita el producto del carrito", () => {
    seedCart([
      { ...catan, cantidad: 1 },
      { ...corsair, cantidad: 1 },
    ]);
    renderCarrito();
    const filas = screen.getAllByRole("row").slice(1); // sin cabecera
    fireEvent.click(within(filas[0]).getByRole("button", { name: "Eliminar" }));
    expect(carritoGuardado()).toHaveLength(1);
    expect(carritoGuardado()[0].id).toBe(4);
  });

  it("'Vaciar Carrito' vacía todo si se confirma", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    seedCart([{ ...catan, cantidad: 2 }]);
    renderCarrito();
    fireEvent.click(screen.getByRole("button", { name: /vaciar carrito/i }));
    expect(carritoGuardado()).toHaveLength(0);
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("'Vaciar Carrito' conserva los productos si se cancela", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    seedCart([{ ...catan, cantidad: 2 }]);
    renderCarrito();
    fireEvent.click(screen.getByRole("button", { name: /vaciar carrito/i }));
    expect(carritoGuardado()).toHaveLength(1);
  });
});

describe("Carrito – descuento Duoc", () => {
  it("sin sesión no aplica descuento", () => {
    seedCart([{ ...catan, cantidad: 1 }]); // subtotal 1000
    renderCarrito();
    expect(screen.getByText("-$0 CLP")).toBeInTheDocument();
    // subtotal y total coinciden cuando no hay descuento
    expect(screen.getAllByText("$1.000 CLP")).toHaveLength(2);
  });

  it("con sesión Duoc aplica 20% de descuento", () => {
    seedAuth({ descuento: true });
    seedCart([{ ...catan, cantidad: 5 }]); // subtotal 5000
    renderCarrito();
    expect(screen.getByText("-$1.000 CLP")).toBeInTheDocument(); // 20% de 5000
    expect(screen.getByText("$4.000 CLP")).toBeInTheDocument(); // total
  });

  it("el descuento redondea hacia arriba (Math.round)", () => {
    seedAuth({ descuento: true });
    seedCart([{ ...catan, cantidad: 1 }, { ...corsair, cantidad: 1 }]); // subtotal 3500 * 0.2 = 700
    renderCarrito();
    expect(screen.getByText("-$700 CLP")).toBeInTheDocument();
    expect(screen.getByText("$2.800 CLP")).toBeInTheDocument();
  });

  it("con sesión no Duoc no aplica descuento", () => {
    seedAuth({ descuento: false });
    seedCart([{ ...catan, cantidad: 3 }]); // subtotal 3000
    renderCarrito();
    expect(screen.getByText("-$0 CLP")).toBeInTheDocument();
    expect(screen.getAllByText("$3.000 CLP")).toHaveLength(2); // subtotal y total
  });
});
