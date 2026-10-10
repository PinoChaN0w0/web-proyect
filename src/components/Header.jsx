import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const enlaces = [
  { to: "/", texto: "Inicio", end: true },
  { to: "/productos", texto: "Productos" },
  { to: "/nosotros", texto: "Nosotros" },
  { to: "/blogs", texto: "Blogs" },
  { to: "/contacto", texto: "Contacto" },
];

export default function Header() {
  const { totalItems } = useCart();
  const { estaLogueado, usuario, logout } = useAuth();

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🎮</span>
          <div>
            <h1>LEVEL-UP</h1>
            <span>GAMER</span>
          </div>
        </Link>

        <nav className="navbar">
          {enlaces.map(({ to, texto, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active" : undefined)}>
              {texto}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {estaLogueado ? (
            <button type="button" className="login-button" onClick={logout} title="Cerrar sesión">
              <i className="fa-solid fa-user"></i> {usuario?.nombre ?? "Mi cuenta"}
            </button>
          ) : (
            <Link to="/login" className="login-button">
              <i className="fa-solid fa-user"></i> Iniciar sesión
            </Link>
          )}
          <NavLink to="/carrito" className={({ isActive }) => "cart-button" + (isActive ? " active" : "")}>
            <i className="fa-solid fa-cart-shopping"></i>
            <span id="cart-count">{totalItems}</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
