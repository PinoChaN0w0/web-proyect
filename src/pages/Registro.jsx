import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const inicial = {
  nombre: "",
  email: "",
  fechaNacimiento: "",
  password: "",
  confirmarPassword: "",
  codigoReferido: "",
};

const iconoLabel = { color: "var(--primary-blue)" };
const textoAyuda = { color: "var(--text-muted)", fontSize: "0.8rem" };

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(inicial);
  const [mensaje, setMensaje] = useState({ texto: "", exito: false });
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = registrar(form);
    if (!res.ok) {
      setMensaje({ texto: res.error, exito: false });
      return;
    }
    setMensaje({ texto: "¡Registro exitoso! Redirigiendo al inicio de sesión...", exito: true });
    timer.current = setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card p-4 p-md-5">
            <h2 className="text-center mb-1" style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue)" }}>
              CREAR CUENTA
            </h2>
            <p className="text-center mb-4" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Únete a la comunidad de Level-Up Gamer
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  <i className="fa-solid fa-gamepad me-1" style={iconoLabel}></i> Gamer Tag o Nombre
                </label>
                <input type="text" className="form-control" id="nombre" placeholder="Ej: ShadowGamer99"
                  value={form.nombre} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  <i className="fa-solid fa-envelope me-1" style={iconoLabel}></i> Correo Electrónico
                </label>
                <input type="email" className="form-control" id="email" placeholder="ejemplo@duocuc.cl"
                  value={form.email} onChange={handleChange} required />
                <div className="form-text mt-1" style={textoAyuda}>
                  Usa tu correo @duocuc.cl para activar un 20% de descuento.
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="fechaNacimiento" className="form-label">
                  <i className="fa-solid fa-calendar-days me-1" style={iconoLabel}></i> Fecha de Nacimiento
                </label>
                <input type="date" className="form-control" id="fechaNacimiento" style={{ colorScheme: "dark" }}
                  value={form.fechaNacimiento} onChange={handleChange} required />
                <div className="form-text mt-1" style={textoAyuda}>
                  Debes ser mayor de 18 años para registrarte.
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">
                    <i className="fa-solid fa-lock me-1" style={iconoLabel}></i> Contraseña
                  </label>
                  <input type="password" className="form-control" id="password" placeholder="Mínimo 6 caracteres"
                    value={form.password} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="confirmarPassword" className="form-label">
                    <i className="fa-solid fa-shield-halved me-1" style={iconoLabel}></i> Confirmar
                  </label>
                  <input type="password" className="form-control" id="confirmarPassword" placeholder="Repite contraseña"
                    value={form.confirmarPassword} onChange={handleChange} required />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="codigoReferido" className="form-label" style={{ color: "var(--text-muted)" }}>
                  <i className="fa-solid fa-ticket me-1"></i> Código de Referido (Opcional)
                </label>
                <input type="text" className="form-control" id="codigoReferido" placeholder="Ej: GAMER2026"
                  value={form.codigoReferido} onChange={handleChange} />
              </div>

              <p className="text-center fw-bold mb-3" style={{ color: mensaje.exito ? "#39FF14" : "#ff4d4d" }}>
                {mensaje.texto}
              </p>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-neon py-2">REGISTRARME</button>
              </div>

              <div className="mt-4 text-center">
                <p className="mb-0 text-light">
                  ¿Ya tienes una cuenta?{" "}
                  <Link to="/login" style={{ color: "var(--primary-blue)", fontWeight: "bold" }}>Inicia sesión aquí</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
