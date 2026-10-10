import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { productos, idsDestacados } from "../data/productos.js";

const destacados = idsDestacados.map((id) => productos.find((p) => p.id === id)).filter(Boolean);

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-subtitle">BIENVENIDO A LEVEL-UP</p>
          <h2>
            TU MUNDO
            <span>GAMER</span>
          </h2>
          <p>
            ¿Buscas productos de calidad para tu experiencia gamer? ¡Estás en el lugar correcto! En Level-Up Gamer,
            encontrarás todo lo que necesitas para llevar tu pasión por los videojuegos al siguiente nivel.
          </p>
          <Link to="/productos" className="primary-button">
            Ver productos
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </section>

      <section className="featured-products">
        <div className="section-title">
          <p>LO MÁS BUSCADO</p>
          <h2>
            PRODUCTOS <span>DESTACADOS</span>
          </h2>
        </div>
        <div className="products-grid">
          {destacados.map((p) => (
            <ProductCard key={p.id} producto={p} compacto />
          ))}
        </div>
      </section>

      <section className="about-preview">
        <div className="about-content">
          <p className="hero-subtitle">LEVEL-UP GAMER</p>
          <h2>
            MÁS QUE UNA TIENDA,
            <span>UNA COMUNIDAD.</span>
          </h2>
          <p>
            Somos una tienda online dedicada a los amantes de los videojuegos, ofreciendo productos de calidad y una
            experiencia de compra pensada especialmente para la comunidad gamer.
          </p>
          <Link to="/nosotros" className="secondary-button">Conócenos</Link>
        </div>
      </section>
    </main>
  );
}
