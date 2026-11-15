import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import { api } from "../api/client.js";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("todos");

  useEffect(() => {
    api.getProducts()
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message || "No se pudieron cargar los productos."))
      .finally(() => setCargando(false));
  }, []);

  const categorias = useMemo(() => [...new Set(productos.map((p) => p.categoria))], [productos]);

  const filtrados = useMemo(() => {
    const q = texto.toLowerCase();
    return productos.filter(
      (p) => p.nombre.toLowerCase().includes(q) && (categoria === "todos" || p.categoria === categoria)
    );
  }, [productos, texto, categoria]);

  return (
    <main>
      <section className="products-header text-center mt-5 mb-4">
        <p style={{ color: "var(--neon-green)", fontWeight: "bold", letterSpacing: 2 }}>LEVEL-UP GAMER</p>
        <h2 style={{ fontFamily: "var(--font-orbitron)", fontSize: 35 }}>
          NUESTROS <span style={{ color: "var(--primary-blue)" }}>PRODUCTOS</span>
        </h2>
        <p className="products-description text-muted mt-3">
          Encuentra todo lo que necesitas para llevar tu experiencia gamer al siguiente nivel.
        </p>
      </section>

      <section className="products-controls mb-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8">
              <div className="d-flex gap-3 align-items-center flex-column flex-md-row">
                <div className="input-group flex-grow-1">
                  <span
                    className="btn btn-outline-primary form-control"
                    id="button-addon1"
                    style={{ maxWidth: 50, backgroundColor: "var(--bg-input)", borderColor: "var(--primary-blue)" }}
                  >
                    <i className="fa-solid fa-magnifying-glass" style={{ color: "var(--text-muted)" }}></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar producto..."
                    aria-label="Buscar producto"
                    aria-describedby="button-addon1"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                  />
                </div>

                <select
                  className="form-select"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  style={{
                    minWidth: 200,
                    width: "auto",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-white)",
                    borderColor: "var(--primary-blue)",
                  }}
                >
                  <option value="todos">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          {cargando && <p className="text-center">Cargando productos...</p>}
          {error && <p className="text-center" style={{ color: "#ff4d4d" }}>{error}</p>}
          {!cargando && !error && (
            <>
              <div className="products-grid">
                {filtrados.map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
              </div>

              {filtrados.length === 0 && (
                <div className="no-results" style={{ display: "block" }}>
                  <i className="fa-solid fa-gamepad"></i>
                  <h3>No encontramos productos</h3>
                  <p>Intenta buscar otro producto o categoría.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
