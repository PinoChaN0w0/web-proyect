import { createContext, useCallback, useContext, useState } from "react";
import { api, setToken } from "../api/client.js";

const AuthContext = createContext(null);
const AUTH_KEY = "auth";

function leerAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistirAuth(data) {
  if (data) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    if (data.token) setToken(data.token);
  } else {
    localStorage.removeItem(AUTH_KEY);
    setToken(null);
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerAuth);

  const login = useCallback(async (emailRaw, passwordRaw) => {
    const email = (emailRaw || "").trim().toLowerCase();
    const password = (passwordRaw || "").trim();
    if (!email || !password) {
      return { ok: false, error: "Error: Todos los campos son obligatorios." };
    }
    try {
      const res = await api.login(email, password);
      const data = {
        token: res.token,
        usuario: { id: res.id, nombre: res.nombre, email: res.email },
        role: res.role,
        descuentoActivo: Boolean(res.descuentoActivo),
      };
      persistirAuth(data);
      setSesion(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message || "Error: Correo o contraseña incorrectos." };
    }
  }, []);

  const registrar = useCallback(async (datosRaw) => {
    const payload = {
      nombre: (datosRaw.nombre || "").trim(),
      fechaNacimiento: datosRaw.fechaNacimiento,
      email: (datosRaw.email || "").trim().toLowerCase(),
      password: datosRaw.password || "",
      confirmarPassword: datosRaw.confirmarPassword || "",
    };
    if (Object.values(payload).some((v) => !v)) {
      return { ok: false, error: "Error: Todos los campos son obligatorios." };
    }
    try {
      await api.register(payload);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message || "Error al registrar usuario." };
    }
  }, []);

  const logout = useCallback(() => {
    persistirAuth(null);
    setSesion(null);
  }, []);

  const role = sesion?.role ?? null;
  const value = {
    usuario: sesion?.usuario ?? null,
    role,
    esAdmin: role === "ADMIN",
    descuentoActivo: sesion?.descuentoActivo ?? false,
    estaLogueado: Boolean(sesion?.token),
    token: sesion?.token ?? null,
    login,
    registrar,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
