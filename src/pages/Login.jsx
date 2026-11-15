import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setCargando(true);
    const res = await login(email, password);
    setCargando(false);
    if (!res.ok) {
      setMensaje(res.error);
      return;
    }
    setMensaje("Inicio de sesión exitoso. Redirigiendo...");
    setTimeout(() => navigate("/"), 1200);
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card p-4 p-md-5">
            <h2 className="text-center mb-4" style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue)" }}>
              INICIAR SESIÓN
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="correo" className="form-label">Correo Electrónico</label>
                <input type="email" className="form-control" id="correo" placeholder="ejemplo@correo.com" required
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input type="password" className="form-control" id="password" placeholder="********" required
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <p
                id="mensajeLogin"
                className="text-center mt-3 fw-bold"
                style={{ color: mensaje.startsWith("Error") ? "#ff4d4d" : "var(--neon-green)" }}
              >
                {mensaje}
              </p>

              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-neon py-2" disabled={cargando}>
                  {cargando ? "INGRESANDO..." : "INGRESAR"}
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="mb-0 text-muted">¿No tienes una cuenta?</p>
                <Link to="/registro" style={{ color: "var(--primary-blue)", textDecoration: "none", fontWeight: "bold" }}>
                  Regístrate aquí
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
