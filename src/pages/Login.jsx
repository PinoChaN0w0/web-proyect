import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", exito: false });
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensaje({ texto: "", exito: false });

    const res = login(email, password);
    if (!res.ok) {
      setMensaje({ texto: res.error, exito: false });
      return;
    }
    setMensaje({ texto: "¡Inicio de sesión exitoso! Redirigiendo...", exito: true });
    timer.current = setTimeout(() => navigate("/"), 2000);
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card p-4 p-md-5">
            <h2 className="text-center mb-2" style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue)" }}>
              INICIAR SESIÓN
            </h2>
            <p className="text-center mb-4" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Bienvenido de vuelta a la arena
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="ejemplo@duocuc.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="form-text mt-1" style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  Usa @duocuc.cl para activar tu descuento
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <p className="text-center fw-bold" style={{ color: mensaje.exito ? "#39FF14" : "#ff4d4d" }}>
                {mensaje.texto}
              </p>

              <div className="d-grid gap-2 mt-4">
                <button type="submit" className="btn btn-neon py-2">ENTRAR A LA ARENA</button>
              </div>

              <div className="mt-4 text-center">
                <p className="mb-0 text-light">
                  ¿No tienes cuenta?{" "}
                  <Link to="/registro" style={{ color: "var(--primary-blue)", fontWeight: "bold" }}>Regístrate aquí</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
