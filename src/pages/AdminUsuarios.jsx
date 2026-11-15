import { useEffect, useState } from "react";
import { api } from "../api/client.js";

const vacio = { nombre: "", email: "", password: "", fechaNacimiento: "", role: "CLIENTE" };

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await api.getUsers();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });
  const limpiar = () => { setForm(vacio); setEditandoId(null); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMensaje("");
    const payload = {
      nombre: form.nombre.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      fechaNacimiento: form.fechaNacimiento || null,
      role: form.role,
    };
    if (!payload.nombre || !payload.email) return setError("Error: nombre y correo son obligatorios.");
    if (editandoId === null && (!payload.password || payload.password.length < 6)) {
      return setError("Error: la contraseña debe tener al menos 6 caracteres.");
    }
    try {
      if (editandoId !== null) {
        await api.updateUser(editandoId, payload);
        setMensaje("Usuario actualizado correctamente.");
      } else {
        await api.createUser(payload);
        setMensaje("Usuario creado correctamente.");
      }
      limpiar();
      await cargar();
    } catch (e2) {
      setError(e2.message || "Error al guardar el usuario.");
    }
  };

  const handleEditar = (u) => {
    setEditandoId(u.id);
    setForm({
      nombre: u.nombre || "",
      email: u.email || "",
      password: "",
      fechaNacimiento: u.fechaNacimiento || "",
      role: u.role || "CLIENTE",
    });
    setError(""); setMensaje("");
  };

  const handleEliminar = async (u) => {
    if (!window.confirm(`¿Eliminar al usuario "${u.email}"?`)) return;
    setError(""); setMensaje("");
    try {
      await api.deleteUser(u.id);
      setMensaje("Usuario eliminado.");
      if (editandoId === u.id) limpiar();
      await cargar();
    } catch (e) {
      setError(e.message || "Error al eliminar el usuario.");
    }
  };

  return (
    <main className="container my-5">
      <h2 className="mb-4" style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue)" }}>
        ADMINISTRAR USUARIOS
      </h2>

      {error && <p className="fw-bold" style={{ color: "#ff4d4d" }}>{error}</p>}
      {mensaje && <p className="fw-bold" style={{ color: "var(--neon-green)" }}>{mensaje}</p>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card p-4">
            <h4 className="mb-3" style={{ fontSize: "1rem" }}>
              {editandoId !== null ? "Editar usuario" : "Agregar usuario"}
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="u-nombre" className="form-label">Nombre</label>
                <input id="u-nombre" className="form-control" value={form.nombre} onChange={cambiar("nombre")} />
              </div>
              <div className="mb-3">
                <label htmlFor="u-email" className="form-label">Correo</label>
                <input id="u-email" type="email" className="form-control" value={form.email} onChange={cambiar("email")} />
              </div>
              <div className="mb-3">
                <label htmlFor="u-pass" className="form-label">Contraseña {editandoId !== null && "(dejar vacío para no cambiar)"}</label>
                <input id="u-pass" type="password" className="form-control" value={form.password} onChange={cambiar("password")} />
              </div>
              <div className="mb-3">
                <label htmlFor="u-fecha" className="form-label">Fecha de nacimiento</label>
                <input id="u-fecha" type="date" className="form-control" value={form.fechaNacimiento} onChange={cambiar("fechaNacimiento")} />
              </div>
              <div className="mb-3">
                <label htmlFor="u-role" className="form-label">Rol</label>
                <select id="u-role" className="form-select" value={form.role} onChange={cambiar("role")}>
                  <option value="CLIENTE">CLIENTE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-neon py-2">
                  {editandoId !== null ? "ACTUALIZAR" : "GUARDAR"}
                </button>
                {editandoId !== null && (
                  <button type="button" className="btn btn-outline-secondary" onClick={limpiar}>Cancelar</button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card p-3">
            {cargando ? <p>Cargando usuarios...</p> : (
              <div className="table-responsive">
                <table className="table table-dark align-middle mb-0">
                  <thead>
                    <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id}>
                        <td>{u.nombre}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td className="text-end text-nowrap">
                          <button type="button" className="btn btn-sm btn-outline-info me-1" onClick={() => handleEditar(u)}>Editar</button>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(u)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
