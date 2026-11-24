import { act, renderHook } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import { api, getToken } from "../api/client.js";

describe("AuthContext", () => {
  beforeEach(() => localStorage.clear());
  const montar = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

  it("login exitoso guarda token, rol y marca sesión", async () => {
    spyOn(api, "login").and.resolveTo({
      token: "jwt", id: 1, nombre: "Admin", email: "admin@levelup.cl", role: "ADMIN",
    });
    const { result } = montar();
    let res;
    await act(async () => { res = await result.current.login("  ADMIN@levelup.cl ", "Admin123!"); });
    expect(res.ok).toBeTrue();
    expect(api.login).toHaveBeenCalledWith("admin@levelup.cl", "Admin123!");
    expect(result.current.estaLogueado).toBeTrue();
    expect(result.current.esAdmin).toBeTrue();
    expect(getToken()).toBe("jwt");
  });

  it("rol CLIENTE no es admin", async () => {
    spyOn(api, "login").and.resolveTo({ token: "t", id: 2, nombre: "C", email: "c@x.cl", role: "CLIENTE" });
    const { result } = montar();
    await act(async () => { await result.current.login("c@x.cl", "Clave123!"); });
    expect(result.current.esAdmin).toBeFalse();
    expect(result.current.role).toBe("CLIENTE");
  });

  it("login con campos vacíos no llama a la API", async () => {
    spyOn(api, "login");
    const { result } = montar();
    let res;
    await act(async () => { res = await result.current.login("", ""); });
    expect(res.ok).toBeFalse();
    expect(api.login).not.toHaveBeenCalled();
  });

  it("login con error de API devuelve ok:false y el mensaje", async () => {
    spyOn(api, "login").and.rejectWith(new Error("Credenciales inválidas"));
    const { result } = montar();
    let res;
    await act(async () => { res = await result.current.login("a@b.cl", "mala"); });
    expect(res).toEqual({ ok: false, error: "Credenciales inválidas" });
    expect(result.current.estaLogueado).toBeFalse();
  });

  it("logout limpia sesión y token", async () => {
    spyOn(api, "login").and.resolveTo({ token: "t", id: 1, nombre: "A", email: "a@b.cl", role: "ADMIN" });
    const { result } = montar();
    await act(async () => { await result.current.login("a@b.cl", "x"); });
    act(() => result.current.logout());
    expect(result.current.estaLogueado).toBeFalse();
    expect(getToken()).toBeNull();
  });

  it("registrar exige todos los campos", async () => {
    spyOn(api, "register");
    const { result } = montar();
    let res;
    await act(async () => { res = await result.current.registrar({ nombre: "X" }); });
    expect(res.ok).toBeFalse();
    expect(api.register).not.toHaveBeenCalled();
  });
});
