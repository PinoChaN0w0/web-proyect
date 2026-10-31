import { useState } from "react";
import { productos as catalogo, categorias } from "../data/productos.js";
import { formatearPrecio } from "../utils/format.js";

// Acceso provisorio (sin backend, queda visible en el navegador)
const ADMIN_EMAIL = "admin@levelup.cl";
const ADMIN_PASSWORD = "admin123";

const STORAGE_KEY = "productosTienda";
const vacio = { nombre: "", categoria: "", precio: "", emoji: "", descripcion: "" };

// Guarda la lista y actualiza el catálogo que lee la tienda (Productos, Inicio, Detalle)
function publicar(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  catalogo.splice(0, catalogo.length, ...lista);
  categorias.splice(0, categorias.length, ...new Set(lista.map((p) => p.categoria)));
}

export default function Admin() {
  const [autorizado, setAutorizado] = useState(() => sessionStorage.getItem("adminOk") === "true");
  const [acceso, setAcceso] = useState({ email: "", password: "" });
  const [errorAcceso, setErrorAcceso] = useState("");

  const [productos, setProductos] = useState(() => [...catalogo]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");

  const guardar = (lista) => {
    publicar(lista);
    setProductos(lista);
  };

  const entrar = (e) => {
    e.preventDefault();
    if (acceso.email.trim().toLowerCase() === ADMIN_EMAIL && acceso.password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminOk", "true");
      setAutorizado(true);
    } else {
      setErrorAcceso("Error: credenciales de administrador incorrectas.");
    }
  };

  const salir = () => {
    sessionStorage.removeItem("adminOk");
    setAutorizado(false);
    setAcceso({ email: "", password: "" });
  };

  if (!autorizado) {
    return (
      <main className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="card p-4 p-md-5">
              <h2 className="text-center mb-4" style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue)" }}>
                ACCESO ADMIN
              </h2>
              <form onSubmit={entrar}>
                <div className="mb-3">
                  <label htmlFor="adminEmail" className="form-label">Correo</label>
                  <input id="adminEmail" type="email" className="form-control" value={acceso.email}
                    onChange={(e) => setAcceso({ ...acceso, email: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="adminPassword" className="form-label">Contraseña</label>
                  <input id="adminPassword" type="password" className="form-control" value={acceso.password}
                    onChange={(e) => setAcceso({ ...acceso, password: e.target.value })} required />
                </div>
                <p className="text-center fw-bold" style={{ color: "#ff4d4d" }}>{errorAcceso}</p>
                <div className="d-grid mt-3">
                  <button type="submit" className="btn btn-neon py-2">ENTRAR</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const limpiar = () => {
    setForm(vacio);
    setEditandoId(null);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const datos = {
      nombre: form.nombre.trim(),
      categoria: form.categoria.trim(),
      precio: Math.round(Number(form.precio)),
      emoji: form.emoji.trim() || "🎮",
      descripcion: form.descripcion.trim(),
    };

    if (!datos.nombre || !datos.categoria) return setError("Error: nombre y categoría son obligatorios.");
    if (!(datos.precio > 0)) return setError("Error: ingresa un precio mayor a 0.");

    if (editandoId !== null) {
      guardar(productos.map((p) => (p.id === editandoId ? { ...p, ...datos } : p)));
    } else {
      guardar([...productos, { ...datos, id: Date.now(), imagen: null }]);
    }
    limpiar();
  };

  const handleEditar = (p) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre,
      categoria: p.categoria,
      precio: String(p.precio),
      emoji: p.emoji ?? "",
      descripcion: p.descripcion ?? "",
    });
    setError("");
  };

  const handleEliminar = (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
    guardar(productos.filter((x) => x.id !== p.id));
    if (editandoId === p.id) limpiar();
  };

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0" style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue)" }}>
          ADMINISTRAR PRODUCTOS
        </h2>
        <button type="button" className="btn btn-outline-light btn-sm" onClick={salir}>Salir</button>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card p-4">
            <h4 className="mb-3" style={{ fontSize: "1rem" }}>
              {editandoId !== null ? "Editar producto" : "Agregar producto"}
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input id="nombre" className="form-control" value={form.nombre} onChange={cambiar("nombre")} />
              </div>
              <div className="mb-3">
                <label htmlFor="categoria" className="form-label">Categoría</label>
                <input id="categoria" className="form-control" value={form.categoria} onChange={cambiar("categoria")} />
              </div>
              <div className="mb-3">
                <label htmlFor="precio" className="form-label">Precio (CLP)</label>
                <input id="precio" type="number" min="1" className="form-control" value={form.precio} onChange={cambiar("precio")} />
              </div>
              <div className="mb-3">
                <label htmlFor="emoji" className="form-label">Emoji</label>
                <input id="emoji" className="form-control" maxLength={4} value={form.emoji} onChange={cambiar("emoji")} />
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea id="descripcion" rows={3} className="form-control" value={form.descripcion} onChange={cambiar("descripcion")} />
              </div>

              <p className="fw-bold" style={{ color: "#ff4d4d" }}>{error}</p>

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
            <div className="table-responsive">
              <table className="table table-dark align-middle mb-0">
                <thead>
                  <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th></th></tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.emoji} {p.nombre}</td>
                      <td>{p.categoria}</td>
                      <td className="text-nowrap">{formatearPrecio(p.precio)}</td>
                      <td className="text-end text-nowrap">
                        <button type="button" className="btn btn-sm btn-outline-info me-1" onClick={() => handleEditar(p)}>Editar</button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(p)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
