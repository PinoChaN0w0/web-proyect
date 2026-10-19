import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import Login from "./Login.jsx";

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
  fireEvent.click(screen.getByRole("button", { name: /entrar a la arena/i }));
}

describe("Login", () => {
  it("muestra el formulario con sus campos", () => {
    renderLogin();
    expect(screen.getByLabelText("Correo Electrónico")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "password");
    expect(screen.getByRole("link", { name: /regístrate aquí/i })).toHaveAttribute("href", "/registro");
  });

  it("muestra error con credenciales de usuario inexistente", () => {
    renderLogin();
    enviarFormulario("nobody@ejemplo.cl", "cualquiera");
    expect(screen.getByText("Error: Correo o contraseña incorrectos.")).toBeInTheDocument();
  });

  it("muestra error con contraseña incorrecta", () => {
    localStorage.setItem("usuarios", JSON.stringify([{ nombre: "U", email: "u@e.cl", password: "buena123" }]));
    renderLogin();
    enviarFormulario("u@e.cl", "mala123");
    expect(screen.getByText("Error: Correo o contraseña incorrectos.")).toBeInTheDocument();
  });

  it("hace login correcto, muestra mensaje de éxito y redirige tras 2 segundos", () => {
    vi.useFakeTimers();
    localStorage.setItem("usuarios", JSON.stringify([{ nombre: "U", email: "u@e.cl", password: "buena123" }]));
    renderLogin();
    enviarFormulario("u@e.cl", "buena123");
    expect(screen.getByText("¡Inicio de sesión exitoso! Redirigiendo...")).toBeInTheDocument();
    expect(localStorage.getItem("usuarioLogueado")).toBe("true");
    act(() => vi.advanceTimersByTime(2000));
    // la navegación ocurre; el mensaje sigue siendo el de éxito
    expect(screen.getByText("¡Inicio de sesión exitoso! Redirigiendo...")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("un intento fallido previo se reemplaza por el mensaje de éxito", () => {
    localStorage.setItem("usuarios", JSON.stringify([{ nombre: "U", email: "u@e.cl", password: "buena123" }]));
    renderLogin();
    enviarFormulario("u@e.cl", "mala123");
    expect(screen.getByText("Error: Correo o contraseña incorrectos.")).toBeInTheDocument();
    enviarFormulario("u@e.cl", "buena123");
    expect(screen.queryByText("Error: Correo o contraseña incorrectos.")).not.toBeInTheDocument();
    expect(screen.getByText(/inicio de sesión exitoso/i)).toBeInTheDocument();
  });

  it("activa el descuento Duoc al loguearse con correo @duocuc.cl", () => {
    localStorage.setItem(
      "usuarios",
      JSON.stringify([{ nombre: "Alumna", email: "a@duocuc.cl", password: "clave123" }])
    );
    renderLogin();
    enviarFormulario("a@duocuc.cl", "clave123");
    expect(localStorage.getItem("descuentoActivo")).toBe("true");
  });
});
