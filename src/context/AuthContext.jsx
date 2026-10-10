import { createContext, useCallback, useContext, useState } from "react";
import { esCorreoDuoc, esEmailValido, esMayorDeEdad } from "../utils/validators.js";

const AuthContext = createContext(null);

const leerJSON = (clave, defecto) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? defecto;
  } catch {
    return defecto;
  }
};

// Mismas claves de localStorage que el sitio estático
function leerSesion() {
  if (localStorage.getItem("usuarioLogueado") !== "true") return null;
  return {
    usuario: leerJSON("usuarioActual", null),
    descuentoActivo: localStorage.getItem("descuentoActivo") === "true",
  };
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);

  const login = useCallback((emailRaw, passwordRaw) => {
    const email = emailRaw.trim().toLowerCase();
    const password = passwordRaw.trim();

    if (!email || !password) {
      return { ok: false, error: "Error: Todos los campos son obligatorios." };
    }

    const usuarios = leerJSON("usuarios", []);
    const encontrado = usuarios.find((u) => u.email === email && u.password === password);
    if (!encontrado) {
      return { ok: false, error: "Error: Correo o contraseña incorrectos." };
    }

    const usuario = { nombre: encontrado.nombre, email: encontrado.email };
    const descuentoActivo = esCorreoDuoc(email);

    localStorage.setItem("usuarioLogueado", "true");
    localStorage.setItem("usuarioActual", JSON.stringify(usuario));
    localStorage.setItem("correoUsuario", email);
    localStorage.setItem("descuentoActivo", String(descuentoActivo));

    setSesion({ usuario, descuentoActivo });
    return { ok: true };
  }, []);

  const registrar = useCallback((datosRaw) => {
    const datos = {
      nombre: datosRaw.nombre.trim(),
      fechaNacimiento: datosRaw.fechaNacimiento,
      email: datosRaw.email.trim().toLowerCase(),
      password: datosRaw.password,
      confirmarPassword: datosRaw.confirmarPassword,
    };

    if (Object.values(datos).some((v) => !v)) {
      return { ok: false, error: "Error: Todos los campos son obligatorios." };
    }
    if (!esMayorDeEdad(datos.fechaNacimiento)) {
      return { ok: false, error: "Error: Debes ser mayor de 18 años para registrarte." };
    }
    if (!esEmailValido(datos.email)) {
      return { ok: false, error: "Error: Ingresa un correo electrónico válido." };
    }
    if (datos.password.length < 6) {
      return { ok: false, error: "Error: La contraseña debe tener al menos 6 caracteres." };
    }
    if (datos.password !== datos.confirmarPassword) {
      return { ok: false, error: "Error: Las contraseñas no coinciden." };
    }

    const usuarios = leerJSON("usuarios", []);
    if (usuarios.some((u) => u.email === datos.email)) {
      return { ok: false, error: "Error: Este correo ya está registrado." };
    }

    usuarios.push({
      nombre: datos.nombre,
      fechaNacimiento: datos.fechaNacimiento,
      email: datos.email,
      password: datos.password,
    });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    ["usuarioLogueado", "usuarioActual", "correoUsuario", "descuentoActivo"].forEach((k) =>
      localStorage.removeItem(k)
    );
    setSesion(null);
  }, []);

  const value = {
    usuario: sesion?.usuario ?? null,
    descuentoActivo: sesion?.descuentoActivo ?? false,
    estaLogueado: Boolean(sesion),
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
