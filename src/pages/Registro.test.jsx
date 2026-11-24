import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import Registro from "./Registro.jsx";
import { api } from "../api/client.js";

// El registro ya no usa localStorage: llama a api.register (backend).
// Se mockea el cliente para no hacer peticiones reales.
vi.mock("../api/client.js", () => ({
  api: { register: vi.fn(), login: vi.fn() },
  setToken: vi.fn(),
  getToken: vi.fn(),
}));

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
  nombre: "Shadow Gamer",
  email: "shadow@ejemplo.cl",
  fechaNacimiento: "1995-06-15",
  password: "clave1234",
  confirmarPassword: "clave1234",
};

const etiquetas = {
  nombre: /Nombre Completo/i,
  email: /Correo Electrónico/i,
  fechaNacimiento: /Fecha de Nacimiento/i,
  password: /^Contraseña$/i, // anclado: si no, también coincide con "Confirmar Contraseña"
  confirmarPassword: /Confirmar Contraseña/i,
};

function llenarYEnviar(datos) {
  for (const [campo, valor] of Object.entries(datos)) {
    fireEvent.change(screen.getByLabelText(etiquetas[campo]), { target: { value: valor } });
  }
  fireEvent.submit(screen.getByRole("button", { name: /registrarse/i }).closest("form"));
}

describe("Registro", () => {
  beforeEach(() => {
    api.register.mockReset();
  });

  it("muestra los 5 campos del formulario", () => {
    renderRegistro();
    expect(screen.getByLabelText(etiquetas.nombre)).toBeInTheDocument();
    expect(screen.getByLabelText(etiquetas.email)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(etiquetas.fechaNacimiento)).toHaveAttribute("type", "date");
    expect(screen.getByLabelText(etiquetas.password)).toHaveAttribute("type", "password");
    expect(screen.getByLabelText(etiquetas.confirmarPassword)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inicia sesión aquí/i })).toHaveAttribute("href", "/login");
  });

  it("registra un usuario válido, normaliza el correo y muestra éxito", async () => {
    api.register.mockResolvedValue({});
    renderRegistro();
    llenarYEnviar({ ...valido, email: "  SHADOW@Ejemplo.CL " });

    expect(await screen.findByText("¡Registro exitoso! Ya puedes iniciar sesión.")).toBeInTheDocument();
    expect(api.register).toHaveBeenCalledWith({
      nombre: "Shadow Gamer",
      fechaNacimiento: "1995-06-15",
      email: "shadow@ejemplo.cl",
      password: "clave1234",
      confirmarPassword: "clave1234",
    });
  });

  it("limpia el formulario tras un registro exitoso", async () => {
    api.register.mockResolvedValue({});
    renderRegistro();
    llenarYEnviar(valido);
    await screen.findByText(/registro exitoso/i);
    expect(screen.getByLabelText(etiquetas.nombre)).toHaveValue("");
  });

  it("no llama al backend si falta algún campo", async () => {
    renderRegistro();
    llenarYEnviar({ ...valido, nombre: "" });
    expect(await screen.findByText("Error: Todos los campos son obligatorios.")).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  // Las validaciones de edad, correo, largo de contraseña y duplicados ahora
  // las hace el backend; aquí se prueba que el front muestre su mensaje de error.
  it.each([
    "Error: Debes ser mayor de 18 años para registrarte.",
    "Error: Ingresa un correo electrónico válido.",
    "Error: La contraseña debe tener al menos 6 caracteres.",
    "Error: Las contraseñas no coinciden.",
    "Error: Este correo ya está registrado.",
  ])("muestra el error del backend: %s", async (mensaje) => {
    api.register.mockRejectedValue(new Error(mensaje));
    renderRegistro();
    llenarYEnviar(valido);
    expect(await screen.findByText(mensaje)).toBeInTheDocument();
  });

  it("un error previo desaparece tras un registro exitoso", async () => {
    api.register.mockRejectedValueOnce(new Error("Error: Este correo ya está registrado."));
    api.register.mockResolvedValueOnce({});
    renderRegistro();

    llenarYEnviar(valido);
    expect(await screen.findByText(/ya está registrado/i)).toBeInTheDocument();

    llenarYEnviar(valido);
    await waitFor(() => expect(screen.queryByText(/ya está registrado/i)).not.toBeInTheDocument());
    expect(await screen.findByText(/registro exitoso/i)).toBeInTheDocument();
  });
});
