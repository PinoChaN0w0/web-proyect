import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import { seedAuth } from "../test/helpers.jsx";

let ctx = null;

function Captura() {
  ctx = useAuth();
  return null;
}

function montar() {
  render(
    <AuthProvider>
      <Captura />
    </AuthProvider>
  );
}

const usuarioNuevo = {
  nombre: "Nuevo Gamer",
  fechaNacimiento: "2000-01-01",
  email: "nuevo@ejemplo.cl",
  password: "secreto123",
  confirmarPassword: "secreto123",
};

const hoy = new Date().toISOString().slice(0, 10);

describe("AuthContext – registrar", () => {
  it("registra un usuario válido y guarda la lista en 'usuarios'", () => {
    montar();
    const res = ctx.registrar(usuarioNuevo);
    expect(res.ok).toBe(true);
    const guardados = JSON.parse(localStorage.getItem("usuarios"));
    expect(guardados).toHaveLength(1);
    expect(guardados[0]).toEqual({
      nombre: "Nuevo Gamer",
      fechaNacimiento: "2000-01-01",
      email: "nuevo@ejemplo.cl",
      password: "secreto123",
    });
  });

  it("normaliza el correo a minúsculas", () => {
    montar();
    ctx.registrar({ ...usuarioNuevo, email: "NUEVO@EJEMPLO.CL" });
    const guardados = JSON.parse(localStorage.getItem("usuarios"));
    expect(guardados[0].email).toBe("nuevo@ejemplo.cl");
  });

  it("rechaza campos vacíos", () => {
    montar();
    const res = ctx.registrar({ ...usuarioNuevo, nombre: "  " });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: Todos los campos son obligatorios.");
    expect(localStorage.getItem("usuarios")).toBeNull();
  });

  it("rechaza menores de edad", () => {
    montar();
    const res = ctx.registrar({ ...usuarioNuevo, fechaNacimiento: hoy });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: Debes ser mayor de 18 años para registrarte.");
  });

  it("rechaza correo inválido", () => {
    montar();
    const res = ctx.registrar({ ...usuarioNuevo, email: "no-es-correo" });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: Ingresa un correo electrónico válido.");
  });

  it("rechaza contraseña menor a 6 caracteres", () => {
    montar();
    const res = ctx.registrar({ ...usuarioNuevo, password: "12345", confirmarPassword: "12345" });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: La contraseña debe tener al menos 6 caracteres.");
  });

  it("rechaza contraseñas que no coinciden", () => {
    montar();
    const res = ctx.registrar({ ...usuarioNuevo, confirmarPassword: "otra12345" });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: Las contraseñas no coinciden.");
  });

  it("rechaza correo ya registrado (valida duplicados)", () => {
    montar();
    ctx.registrar(usuarioNuevo);
    const res = ctx.registrar(usuarioNuevo);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: Este correo ya está registrado.");
    expect(JSON.parse(localStorage.getItem("usuarios"))).toHaveLength(1);
  });

  it("rechaza duplicado aunque el correo llegue en mayúsculas", () => {
    montar();
    ctx.registrar(usuarioNuevo);
    const res = ctx.registrar({ ...usuarioNuevo, email: "NUEVO@EJEMPLO.CL" });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: Este correo ya está registrado.");
  });
});

describe("AuthContext – login", () => {
  function registrarYLuego(email, password) {
    montar();
    let res;
    act(() => {
      ctx.registrar({ ...usuarioNuevo, email, password, confirmarPassword: password });
      res = ctx.login(email, password);
    });
    return res;
  }

  it("rechaza credenciales de usuario no registrado", () => {
    montar();
    const res = ctx.login("fantasma@ejemplo.cl", "cualquiera");
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: Correo o contraseña incorrectos.");
  });

  it("rechaza correo y contraseña vacíos", () => {
    montar();
    const res = ctx.login("   ", "");
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: Todos los campos son obligatorios.");
  });

  it("rechaza contraseña incorrecta", () => {
    registrarYLuego("user@ejemplo.cl", "clave12345");
    const res = ctx.login("user@ejemplo.cl", "clave-equivocada");
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Error: Correo o contraseña incorrectos.");
  });

  it("hace login con credenciales válidas y activa la sesión", () => {
    const res = registrarYLuego("user@ejemplo.cl", "clave12345");
    expect(res.ok).toBe(true);
    expect(ctx.estaLogueado).toBe(true);
    expect(ctx.usuario).toEqual({ nombre: "Nuevo Gamer", email: "user@ejemplo.cl" });
    expect(ctx.descuentoActivo).toBe(false);
  });

  it("escribe todas las claves de sesión en localStorage", () => {
    registrarYLuego("user@ejemplo.cl", "clave12345");
    expect(localStorage.getItem("usuarioLogueado")).toBe("true");
    expect(JSON.parse(localStorage.getItem("usuarioActual")).email).toBe("user@ejemplo.cl");
    expect(localStorage.getItem("correoUsuario")).toBe("user@ejemplo.cl");
    expect(localStorage.getItem("descuentoActivo")).toBe("false");
  });

  it("activa el descuento Duoc con correo @duocuc.cl", () => {
    registrarYLuego("alumno@duocuc.cl", "clave12345");
    expect(ctx.descuentoActivo).toBe(true);
    expect(localStorage.getItem("descuentoActivo")).toBe("true");
  });

  it("activa el descuento Duoc con correo @duoc.cl", () => {
    registrarYLuego("profe@duoc.cl", "clave12345");
    expect(ctx.descuentoActivo).toBe(true);
  });

  it("normaliza el correo al hacer login (mayúsculas + espacios)", () => {
    registrarYLuego("user@ejemplo.cl", "clave12345");
    let res;
    act(() => {
      res = ctx.login("  USER@EJEMPLO.CL ", "clave12345");
    });
    expect(res.ok).toBe(true);
  });
});

describe("AuthContext – sesión y logout", () => {
  it("restaura la sesión desde localStorage al iniciar", () => {
    seedAuth({ nombre: "Persistido", email: "p@ejemplo.cl", descuento: true });
    montar();
    expect(ctx.estaLogueado).toBe(true);
    expect(ctx.usuario.nombre).toBe("Persistido");
    expect(ctx.descuentoActivo).toBe(true);
  });

  it("sin datos de sesión arranca deslogueado", () => {
    montar();
    expect(ctx.estaLogueado).toBe(false);
    expect(ctx.usuario).toBeNull();
    expect(ctx.descuentoActivo).toBe(false);
  });

  it("caso de error: usuarioActual con JSON corrupto no revienta la app", () => {
    localStorage.setItem("usuarioLogueado", "true");
    localStorage.setItem("usuarioActual", "{{{{");
    montar();
    expect(ctx.usuario).toBeNull();
    expect(ctx.descuentoActivo).toBe(false);
  });

  it("logout limpia las claves de sesión y desloguea", () => {
    seedAuth({ descuento: true });
    montar();
    expect(ctx.estaLogueado).toBe(true);
    act(() => ctx.logout());
    expect(ctx.estaLogueado).toBe(false);
    expect(ctx.usuario).toBeNull();
    for (const k of ["usuarioLogueado", "usuarioActual", "correoUsuario", "descuentoActivo"]) {
      expect(localStorage.getItem(k)).toBeNull();
    }
  });

  it("lanza un error claro al usar useAuth fuera del provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Captura />)).toThrow("useAuth debe usarse dentro de <AuthProvider>");
    consoleSpy.mockRestore();
  });
});
