import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import Registro from "./Registro.jsx";

function renderRegistro() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/registro"]}>
        <Registro />
      </MemoryRouter>
    </AuthProvider>
  );
}

const valido = {
  nombre: "ShadowGamer99",
  email: "shadow@ejemplo.cl",
  fechaNacimiento: "1995-06-15",
  password: "clave1234",
  confirmarPassword: "clave1234",
  codigoReferido: "",
};

const etiquetas = {
  nombre: /Gamer Tag/i,
  email: /Correo Electrónico/i,
  fechaNacimiento: /Fecha de Nacimiento/i,
  password: /Contraseña/i,
  confirmarPassword: /Confirmar/i,
  codigoReferido: /Código de Referido/i,
};

function llenarYEnviar(datos) {
  for (const [campo, valor] of Object.entries(datos)) {
    fireEvent.change(screen.getByLabelText(etiquetas[campo]), { target: { value: valor } });
  }
  // submit directo: la validación de HTML (required, type=email) la cubre el
  // navegador; aquí probamos la validación de la aplicación en registrar().
  fireEvent.submit(screen.getByRole("button", { name: /registrarme/i }).closest("form"));
}

describe("Registro", () => {
  it("muestra los 6 campos del formulario", () => {
    renderRegistro();
    expect(screen.getByLabelText(/Gamer Tag/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha de Nacimiento/i)).toHaveAttribute("type", "date");
    expect(screen.getByLabelText(/^Contraseña/i)).toHaveAttribute("type", "password");
    expect(screen.getByLabelText(/Confirmar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Código de Referido/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inicia sesión aquí/i })).toHaveAttribute("href", "/login");
  });

  it("registra un usuario válido y muestra mensaje de éxito", () => {
    renderRegistro();
    llenarYEnviar(valido);
    expect(screen.getByText("¡Registro exitoso! Redirigiendo al inicio de sesión...")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("usuarios"))).toHaveLength(1);
  });

  it("rechaza menores de edad", () => {
    renderRegistro();
    const hoy = new Date().toISOString().slice(0, 10);
    llenarYEnviar({ ...valido, fechaNacimiento: hoy });
    expect(screen.getByText("Error: Debes ser mayor de 18 años para registrarte.")).toBeInTheDocument();
    expect(localStorage.getItem("usuarios")).toBeNull();
  });

  it("rechaza correo inválido", () => {
    renderRegistro();
    llenarYEnviar({ ...valido, email: "no-es-un-correo" });
    expect(screen.getByText("Error: Ingresa un correo electrónico válido.")).toBeInTheDocument();
  });

  it("rechaza contraseña corta", () => {
    renderRegistro();
    llenarYEnviar({ ...valido, password: "123", confirmarPassword: "123" });
    expect(screen.getByText("Error: La contraseña debe tener al menos 6 caracteres.")).toBeInTheDocument();
  });

  it("rechaza contraseñas que no coinciden", () => {
    renderRegistro();
    llenarYEnviar({ ...valido, confirmarPassword: "distinta1" });
    expect(screen.getByText("Error: Las contraseñas no coinciden.")).toBeInTheDocument();
  });

  it("rechaza correo ya registrado", () => {
    renderRegistro();
    llenarYEnviar(valido);
    llenarYEnviar(valido);
    expect(screen.getByText("Error: Este correo ya está registrado.")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("usuarios"))).toHaveLength(1);
  });

  it("el campo código de referido es opcional y no rompe el registro", () => {
    renderRegistro();
    llenarYEnviar({ ...valido, codigoReferido: "GAMER2026" });
    expect(screen.getByText(/registro exitoso/i)).toBeInTheDocument();
  });

  it("un error previo desaparece tras un registro exitoso", () => {
    renderRegistro();
    llenarYEnviar({ ...valido, password: "123", confirmarPassword: "123" });
    expect(screen.getByText(/al menos 6 caracteres/i)).toBeInTheDocument();
    llenarYEnviar(valido);
    expect(screen.queryByText(/al menos 6 caracteres/i)).not.toBeInTheDocument();
    expect(screen.getByText(/registro exitoso/i)).toBeInTheDocument();
  });
});
