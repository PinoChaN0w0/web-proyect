import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { productos } from "./data/productos.js";
import { api } from "./api/client.js";
import { seedAuth } from "./test/helpers.jsx";

// Las páginas cargan datos del backend: se simula la API.
vi.mock("./api/client.js", () => ({
  api: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    getUsers: vi.fn(),
  },
  setToken: vi.fn(),
  getToken: vi.fn(),
}));

function renderEnRuta(ruta) {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[ruta]}>
          <App />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
}

beforeEach(() => {
  api.getProducts.mockReset().mockResolvedValue(productos);
  api.getProduct.mockReset().mockImplementation(async (id) => productos.find((p) => String(p.id) === String(id)));
  api.getUsers.mockReset().mockResolvedValue([]);
});

describe("App – enrutado", () => {
  it("en '/' muestra el Home dentro del Layout (header y footer)", async () => {
    renderEnRuta("/");
    expect(await screen.findByText("BIENVENIDO A LEVEL-UP")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    await screen.findAllByRole("article"); // deja terminar la carga de destacados
  });

  it("en '/productos' muestra el listado", async () => {
    renderEnRuta("/productos");
    expect(screen.getByText(/NUESTROS/)).toBeInTheDocument();
    await screen.findAllByRole("article");
  });

  it("en '/productos/1' muestra el detalle de Catan", async () => {
    renderEnRuta("/productos/1");
    expect(await screen.findByRole("heading", { name: "Catan" })).toBeInTheDocument();
  });

  it("en '/carrito' muestra el carrito", () => {
    renderEnRuta("/carrito");
    expect(screen.getByText("TU CARRITO DE COMPRAS")).toBeInTheDocument();
  });

  it("en '/login' muestra el formulario de sesión", () => {
    renderEnRuta("/login");
    expect(screen.getByText("INICIAR SESIÓN")).toBeInTheDocument();
  });

  it("en '/registro' muestra el formulario de registro", () => {
    renderEnRuta("/registro");
    expect(screen.getByText("CREAR UNA CUENTA")).toBeInTheDocument();
  });

  it("'/admin' sin sesión redirige al login", () => {
    renderEnRuta("/admin");
    expect(screen.getByText("INICIAR SESIÓN")).toBeInTheDocument();
  });

  it("'/admin' con un cliente (no admin) redirige al inicio", async () => {
    seedAuth({ role: "CLIENTE" });
    renderEnRuta("/admin");
    expect(await screen.findByText("BIENVENIDO A LEVEL-UP")).toBeInTheDocument();
    await screen.findAllByRole("article");
  });

  it("'/admin' con un administrador muestra el panel de productos", async () => {
    seedAuth({ role: "ADMIN" });
    renderEnRuta("/admin");
    expect(await screen.findByText("ADMINISTRAR PRODUCTOS")).toBeInTheDocument();
    await screen.findByRole("row", { name: /Catan/ });
  });

  it("las rutas pendientes muestran 'Página no encontrada'", () => {
    renderEnRuta("/esto-no-existe");
    expect(screen.getByText("Página no encontrada")).toBeInTheDocument();
  });

  it("'/nosotros', '/blogs' y '/contacto' usan la página Proximamente", () => {
    renderEnRuta("/nosotros");
    expect(screen.getByRole("heading", { name: "Nosotros" })).toBeInTheDocument();
  });
});
