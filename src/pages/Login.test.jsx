import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import Login from "./Login.jsx";
import { api } from "../api/client.js";

// Login ahora llama al backend (api.login) y guarda la sesión en localStorage["auth"].
vi.mock("../api/client.js", () => ({
  api: { login: vi.fn(), register: vi.fn() },
  setToken: vi.fn(),
  getToken: vi.fn(),
}));

const navigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => navigate };
});

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <Login />
      </MemoryRouter>
    </AuthProvider>
  );
}

function enviarFormulario(email, password) {
  fireEvent.change(screen.getByLabelText("Correo Electrónico"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
}

const respuestaOk = (extra = {}) => ({
  token: "tok123",
  id: 1,
  nombre: "U",
  email: "u@e.cl",
  role: "USER",
  descuentoActivo: false,
  ...extra,
});

describe("Login", () => {
  beforeEach(() => {
    api.login.mockReset();
    navigate.mockReset();
  });

  it("muestra el formulario con sus campos", () => {
    renderLogin();
    expect(screen.getByLabelText("Correo Electrónico")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "password");
    expect(screen.getByRole("link", { name: /regístrate aquí/i })).toHaveAttribute("href", "/registro");
  });

  it("muestra el error que devuelve el backend con credenciales inválidas", async () => {
    api.login.mockRejectedValue(new Error("Error: Correo o contraseña incorrectos."));
    renderLogin();
    enviarFormulario("nobody@ejemplo.cl", "cualquiera");
    expect(await screen.findByText("Error: Correo o contraseña incorrectos.")).toBeInTheDocument();
    expect(localStorage.getItem("auth")).toBeNull();
  });

  it("hace login correcto, guarda la sesión y redirige a '/'", async () => {
    api.login.mockResolvedValue(respuestaOk());
    renderLogin();
    enviarFormulario("u@e.cl", "buena123");

    expect(await screen.findByText("Inicio de sesión exitoso. Redirigiendo...")).toBeInTheDocument();
    expect(api.login).toHaveBeenCalledWith("u@e.cl", "buena123");
    expect(JSON.parse(localStorage.getItem("auth"))).toMatchObject({ token: "tok123", role: "USER" });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/"), { timeout: 2500 });
  });

  it("un intento fallido previo se reemplaza por el mensaje de éxito", async () => {
    api.login.mockRejectedValueOnce(new Error("Error: Correo o contraseña incorrectos."));
    api.login.mockResolvedValueOnce(respuestaOk());
    renderLogin();

    enviarFormulario("u@e.cl", "mala123");
    expect(await screen.findByText("Error: Correo o contraseña incorrectos.")).toBeInTheDocument();

    enviarFormulario("u@e.cl", "buena123");
    expect(await screen.findByText(/inicio de sesión exitoso/i)).toBeInTheDocument();
    expect(screen.queryByText("Error: Correo o contraseña incorrectos.")).not.toBeInTheDocument();
  });

  it("guarda descuentoActivo cuando el backend lo marca (correo @duocuc.cl)", async () => {
    api.login.mockResolvedValue(respuestaOk({ email: "a@duocuc.cl", descuentoActivo: true }));
    renderLogin();
    enviarFormulario("a@duocuc.cl", "clave123");
    await screen.findByText(/inicio de sesión exitoso/i);
    expect(JSON.parse(localStorage.getItem("auth")).descuentoActivo).toBe(true);
  });

  it("no llama al backend si faltan campos", async () => {
    renderLogin();
    // submit directo: con click, la validación HTML (required) bloquearía el evento
    fireEvent.submit(screen.getByRole("button", { name: /ingresar/i }).closest("form"));
    expect(await screen.findByText("Error: Todos los campos son obligatorios.")).toBeInTheDocument();
    expect(api.login).not.toHaveBeenCalled();
  });
});
