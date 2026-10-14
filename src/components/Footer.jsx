import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>LEVEL-UP</h2>
          <p>Tu tienda gamer de confianza.</p>
        </div>
        <div className="footer-section">
          <h3>Navegación</h3>
          <Link to="/">Inicio</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/blogs">Blogs</Link>
        </div>
        <div className="footer-section">
          <h3>Ayuda</h3>
          <Link to="/contacto">Contacto</Link>
          <a href="#">Despachos</a>
          <a href="#">Términos y condiciones</a>
        </div>
        <div className="footer-section">
          <h3>Contacto</h3>
          <p><i className="fa-solid fa-phone"></i> +56 9 6650 5847</p>
          <p><i className="fa-solid fa-envelope"></i> contacto@levelup.cl</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Level-Up Gamer. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
