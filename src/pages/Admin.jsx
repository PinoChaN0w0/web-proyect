import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { formatearPrecio } from "../utils/format.js";

const vacio = { nombre: "", categoria: "", precio: "", emoji: "", descripcion: "", imagen: "" };

export default function Admin() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await api.getProducts();
      setProductos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const limpiar = () => {
    setForm(vacio);
    setEditandoId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    const datos = {
      nombre: form.nombre.trim(),
      categoria: form.categoria.trim(),
      precio: Math.round(Number(form.precio)),
      emoji: form.emoji.trim() || "🎮",
      imagen: form.imagen.trim() || null,
      descripcion: form.descripcion.trim(),
    };
    if (!datos.nombre || !datos.categoria) return setError("Error: nombre y categoría son obligatorios.");
    if (!(datos.precio > 0)) return setError("Error: ingresa un precio mayor a 0.");

    try {
      if (editandoId !== null) {
        await api.updateProduct(editandoId, datos);
        setMensaje("Producto actualizado correctamente.");
      } else {
        await api.createProduct(datos);
        setMensaje("Producto creado correctamente.");
      }
      limpiar();
      await cargar();
    } catch (e2) {
      setError(e2.message || "Error al guardar el producto.");
    }
  };

  const handleEditar = (p) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre || "",
      categoria: p.categoria || "",
      precio: String(p.precio ?? ""),
      emoji: p.emoji ?? "",
      imagen: p.imagen ?? "",
      descripcion: p.descripcion ?? "",
    });
    setError("");
    setMensaje("");
  };

  const handleEliminar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
    setError("");
    setMensaje("");
    try {
      await api.deleteProduct(p.id);
      setMensaje("Producto eliminado.");
      if (editandoId === p.id) limpiar();
      await cargar();
    } catch (e) {
      setError(e.message || "Error al eliminar el producto.");
    }
  };

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0" style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue)" }}>
          ADMINISTRAR PRODUCTOS
        </h2>
      </div>

      {error && <p className="fw-bold" style={{ color: "#ff4d4d" }}>{error}</p>}
      {mensaje && <p className="fw-bold" style={{ color: "var(--neon-green)" }}>{mensaje}</p>}

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
                <label htmlFor="imagen" className="form-label">Imagen (ruta en /public o URL)</label>
                <input id="imagen" className="form-control" value={form.imagen} onChange={cambiar("imagen")} />
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea id="descripcion" rows={3} className="form-control" value={form.descripcion} onChange={cambiar("descripcion")} />
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
            {cargando ? <p>Cargando productos...</p> : (
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
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
