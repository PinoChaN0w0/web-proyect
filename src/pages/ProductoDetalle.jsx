import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductImage from "../components/ProductImage.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api/client.js";
import { formatearPrecio } from "../utils/format.js";

export default function ProductoDetalle() {
  const { id } = useParams();
  const { agregar } = useCart();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    setError("");
    api.getProduct(id)
      .then(setProducto)
      .catch((e) => setError(e.status === 404 ? "Producto no encontrado" : (e.message || "Error al cargar el producto")))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return <main className="container my-5 text-center"><p>Cargando producto...</p></main>;
  }

  if (error || !producto) {
    return (
      <main className="container my-5 text-center">
        <h2 style={{ fontFamily: "var(--font-orbitron)" }}>{error || "Producto no encontrado"}</h2>
        <Link to="/productos" className="btn btn-neon mt-3">Volver a productos</Link>
      </main>
    );
  }

  return (
    <main className="container my-5">
      <div className="row g-4 align-items-center">
        <div className="col-md-5">
          <ProductImage producto={producto} />
        </div>
        <div className="col-md-7">
          <span className="product-category">{producto.categoria}</span>
          <h2 style={{ fontFamily: "var(--font-orbitron)" }}>{producto.nombre}</h2>
          <p className="text-muted">{producto.descripcion}</p>
          <p className="product-price">{formatearPrecio(producto.precio)}</p>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-neon" onClick={() => agregar(producto)}>
              <i className="fa-solid fa-cart-plus me-1"></i> Agregar al carrito
            </button>
            <Link to="/productos" className="btn btn-outline-light">Volver</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
