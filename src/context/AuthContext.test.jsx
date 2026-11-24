import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import { api, setToken } from "../api/client.js";
import { seedAuth } from "../test/helpers.jsx";

// AuthContext habla con el backend (api.login / api.register) y guarda la sesión en localStorage["auth"].
vi.mock("../api/client.js", () => ({
  api: { login: vi.fn(), register: vi.fn() },
  setToken: vi.fn(),
  getToken: vi.fn(),
}));

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

const respuestaLogin = (extra = {}) => ({
  token: "jwt",
  id: 1,
  nombre: "Nuevo Gamer",
  email: "user@ejemplo.cl",
  role: "CLIENTE",
  descuentoActivo: false,
  ...extra,
});

beforeEach(() => {
  api.login.mockReset();
  api.register.mockReset();
  setToken.mockClear();
  ctx = null;
});

describe("AuthContext – registrar", () => {
  it("registra un usuario válido enviando el payload normalizado al backend", async () => {
    api.register.mockResolvedValue({});
    montar();
    let res;
    await act(async () => {
      res = await ctx.registrar({ ...usuarioNuevo, nombre: "  Nuevo Gamer ", email: "  NUEVO@EJEMPLO.CL " });
    });
    expect(res.ok).toBe(true);
    expect(api.register).toHaveBeenCalledWith({
      nombre: "Nuevo Gamer",
      fechaNacimiento: "2000-01-01",
      email: "nuevo@ejemplo.cl",
      password: "secreto123",
      confirmarPassword: "secreto123",
    });
  });

  it("rechaza campos vacíos sin llamar al backend", async () => {
    montar();
    let res;
    await act(async () => {
      res = await ctx.registrar({ ...usuarioNuevo, nombre: "  " });
    });
    expect(res).toEqual({ ok: false, error: "Error: Todos los campos son obligatorios." });
    expect(api.register).not.toHaveBeenCalled();
  });

  it("devuelve el mensaje de error del backend (edad, correo, duplicado, etc.)", async () => {
    api.register.mockRejectedValue(new Error("Error: Este correo ya está registrado."));
    montar();
    let res;
    await act(async () => {
      res = await ctx.registrar(usuarioNuevo);
    });
    expect(res).toEqual({ ok: false, error: "Error: Este correo ya está registrado." });
  });

  it("usa un mensaje genérico si el error no trae texto", async () => {
    api.register.mockRejectedValue(new Error(""));
    montar();
    let res;
    await act(async () => {
      res = await ctx.registrar(usuarioNuevo);
    });
    expect(res).toEqual({ ok: false, error: "Error al registrar usuario." });
  });
});

describe("AuthContext – login", () => {
  it("rechaza correo y contraseña vacíos sin llamar al backend", async () => {
    montar();
    let res;
    await act(async () => {
      res = await ctx.login("   ", "");
    });
    expect(res).toEqual({ ok: false, error: "Error: Todos los campos son obligatorios." });
    expect(api.login).not.toHaveBeenCalled();
  });

  it("devuelve el error del backend con credenciales inválidas", async () => {
    api.login.mockRejectedValue(new Error("Error: Correo o contraseña incorrectos."));
    montar();
    let res;
    await act(async () => {
      res = await ctx.login("fantasma@ejemplo.cl", "cualquiera");
    });
    expect(res).toEqual({ ok: false, error: "Error: Correo o contraseña incorrectos." });
    expect(ctx.estaLogueado).toBe(false);
  });

  it("hace login válido: activa la sesión, guarda token y rol", async () => {
    api.login.mockResolvedValue(respuestaLogin({ email: "user@ejemplo.cl" }));
    montar();
    let res;
    await act(async () => {
      res = await ctx.login("user@ejemplo.cl", "clave12345");
    });
    expect(res.ok).toBe(true);
    expect(ctx.estaLogueado).toBe(true);
    expect(ctx.usuario).toEqual({ id: 1, nombre: "Nuevo Gamer", email: "user@ejemplo.cl" });
    expect(ctx.role).toBe("CLIENTE");
    expect(ctx.esAdmin).toBe(false);
    expect(ctx.descuentoActivo).toBe(false);
    expect(setToken).toHaveBeenCalledWith("jwt");
  });

  it("escribe la sesión completa en localStorage['auth']", async () => {
    api.login.mockResolvedValue(respuestaLogin());
    montar();
    await act(async () => {
      await ctx.login("user@ejemplo.cl", "clave12345");
    });
    expect(JSON.parse(localStorage.getItem("auth"))).toEqual({
      token: "jwt",
      usuario: { id: 1, nombre: "Nuevo Gamer", email: "user@ejemplo.cl" },
      role: "CLIENTE",
      descuentoActivo: false,
    });
  });

  it("el rol ADMIN activa esAdmin", async () => {
    api.login.mockResolvedValue(respuestaLogin({ role: "ADMIN" }));
    montar();
    await act(async () => {
      await ctx.login("admin@levelup.cl", "Admin123!");
    });
    expect(ctx.esAdmin).toBe(true);
    expect(ctx.role).toBe("ADMIN");
  });

  it("descuentoActivo lo decide el backend (convenio Duoc)", async () => {
    api.login.mockResolvedValue(respuestaLogin({ email: "alumno@duocuc.cl", descuentoActivo: true }));
    montar();
    await act(async () => {
      await ctx.login("alumno@duocuc.cl", "clave12345");
    });
    expect(ctx.descuentoActivo).toBe(true);
  });

  it("normaliza el correo al hacer login (mayúsculas + espacios)", async () => {
    api.login.mockResolvedValue(respuestaLogin());
    montar();
    await act(async () => {
      await ctx.login("  USER@EJEMPLO.CL ", "clave12345");
    });
    expect(api.login).toHaveBeenCalledWith("user@ejemplo.cl", "clave12345");
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
    expect(ctx.role).toBeNull();
    expect(ctx.descuentoActivo).toBe(false);
  });

  it("caso de error: 'auth' con JSON corrupto no revienta la app", () => {
    localStorage.setItem("auth", "{{{{");
    montar();
    expect(ctx.estaLogueado).toBe(false);
    expect(ctx.usuario).toBeNull();
  });

  it("logout limpia la sesión y el token", () => {
    seedAuth({ descuento: true });
    montar();
    expect(ctx.estaLogueado).toBe(true);
    act(() => ctx.logout());
    expect(ctx.estaLogueado).toBe(false);
    expect(ctx.usuario).toBeNull();
    expect(localStorage.getItem("auth")).toBeNull();
    expect(setToken).toHaveBeenCalledWith(null);
  });

  it("lanza un error claro al usar useAuth fuera del provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Captura />)).toThrow("useAuth debe usarse dentro de <AuthProvider>");
    consoleSpy.mockRestore();
  });
});
