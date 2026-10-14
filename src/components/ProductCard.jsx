import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatearPrecio } from "../utils/format.js";
import ProductImage from "./ProductImage.jsx";

export default function ProductCard({ producto, compacto = false }) {
  const { agregar } = useCart();

  const handleAgregar = () => {
    agregar(producto);
    alert(`${producto.nombre} fue agregado al carrito.`);
  };

  return (
    <article className="product-card">
      <ProductImage producto={producto} />
      <div className="product-info">
        <span className="product-category">{producto.categoria}</span>
        <h3>{producto.nombre}</h3>
        {!compacto && <p className="product-description">{producto.descripcion}</p>}
        <p className="product-price">{formatearPrecio(producto.precio)}</p>
        {compacto ? (
          <Link to={`/productos/${producto.id}`} className="product-button">Ver producto</Link>
        ) : (
          <div className="product-actions">
            <Link to={`/productos/${producto.id}`} className="product-button">Ver producto</Link>
            <button type="button" className="add-cart-button" onClick={handleAgregar}>
              <i className="fa-solid fa-cart-plus"></i> Agregar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
