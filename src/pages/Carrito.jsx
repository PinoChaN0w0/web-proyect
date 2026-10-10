import { Link } from "react-router-dom";
import ProductImage from "../components/ProductImage.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatearPrecio } from "../utils/format.js";

const PORCENTAJE_DESCUENTO_DUOC = 0.2;

export default function Carrito() {
  const { items, subtotal, sumar, restar, eliminar, vaciar } = useCart();
  const { descuentoActivo } = useAuth();

  const descuento = descuentoActivo ? Math.round(subtotal * PORCENTAJE_DESCUENTO_DUOC) : 0;
  const total = subtotal - descuento;
  const vacio = items.length === 0;

  const handleVaciar = () => {
    if (window.confirm("¿Estás seguro de vaciar tu carrito?")) vaciar();
  };

  return (
    <main className="container my-5">
      <h2
        className="mb-4 text-center text-md-start"
        style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue, #1E90FF)" }}
      >
        <i className="fa-solid fa-cart-shopping me-2"></i> TU CARRITO DE COMPRAS
      </h2>

      <div className="row g-4">
        {/* DETALLE */}
        <div className="col-lg-8">
          <div className="card p-3 p-md-4 shadow-sm">
            {!vacio && (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr
                      className="text-uppercase"
                      style={{ fontFamily: "var(--font-orbitron)", borderBottom: "2px solid var(--primary-blue, #1E90FF)" }}
                    >
                      <th scope="col">Producto</th>
                      <th scope="col" className="text-center">Precio</th>
                      <th scope="col" className="text-center" style={{ width: 120 }}>Cantidad</th>
                      <th scope="col" className="text-end">Subtotal</th>
                      <th scope="col" className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <ProductImage producto={p} variant="thumb" />
                            <div>
                              <h6 className="mb-0 text-white fw-bold">{p.nombre}</h6>
                              <small style={{ color: "var(--neon-green, #39FF14)" }}>{p.categoria || "Gamer"}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center text-light">${p.precio.toLocaleString("es-CL")}</td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => restar(p.id)} aria-label="Restar uno">
                              <i className="fa-solid fa-minus"></i>
                            </button>
                            <span className="text-white fw-bold px-2">{p.cantidad}</span>
                            <button type="button" className="btn btn-outline-info btn-sm" onClick={() => sumar(p.id)} aria-label="Sumar uno">
                              <i className="fa-solid fa-plus"></i>
                            </button>
                          </div>
                        </td>
                        <td className="text-end text-success fw-bold fs-6">
                          ${(p.precio * p.cantidad).toLocaleString("es-CL")}
                        </td>
                        <td className="text-center">
                          <button type="button" className="btn btn-link text-danger p-0" onClick={() => eliminar(p.id)} aria-label="Eliminar">
                            <i className="fa-solid fa-trash-can fs-5"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {vacio && (
              <div className="text-center py-5">
                <i className="fa-solid fa-cart-flatbed display-1 mb-3 text-muted"></i>
                <h4>Tu carrito está vacío</h4>
                <p className="text-muted mb-4">¿No sabes qué llevar? Explora nuestro catálogo de productos.</p>
                <Link to="/productos" className="btn btn-neon px-4 py-2">
                  <i className="fa-solid fa-store me-2"></i>Ir a la Tienda
                </Link>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary">
              <Link to="/productos" className="btn btn-outline-light btn-sm">
                <i className="fa-solid fa-arrow-left me-1"></i> Seguir Comprando
              </Link>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleVaciar}>
                <i className="fa-solid fa-trash-can me-1"></i> Vaciar Carrito
              </button>
            </div>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm" style={{ border: "1px solid var(--primary-blue, #1E90FF)" }}>
            <h4 className="mb-3" style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue, #1E90FF)" }}>
              RESUMEN DEL PEDIDO
            </h4>
            <hr className="border-secondary" />

            <div className="d-flex justify-content-between mb-2 text-light">
              <span>Subtotal productos:</span>
              <span className="fw-bold">{formatearPrecio(subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 text-success">
              <span>Descuento (Convenio Duoc):</span>
              <span className="fw-bold">-{formatearPrecio(descuento)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 text-light">
              <span>Envío:</span>
              <span className="text-info fw-bold">GRATIS</span>
            </div>

            <div className="mb-3">
              <label htmlFor="coupon-code" className="form-label text-muted small">¿Tienes un cupón?</label>
              <div className="input-group">
                <input type="text" id="coupon-code" className="form-control" placeholder="Ej: DUOCUC" />
                <button type="button" className="btn btn-outline-info">Aplicar</button>
              </div>
            </div>

            <hr className="border-secondary" />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="h5 mb-0 fw-bold">TOTAL:</span>
              <span className="h4 mb-0 fw-bold text-success" style={{ fontFamily: "var(--font-orbitron)" }}>
                {formatearPrecio(total)}
              </span>
            </div>

            <div className="d-grid">
              <button type="button" className="btn btn-neon py-3 fs-6">
                PROCEDER AL PAGO <i className="fa-solid fa-credit-card ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
