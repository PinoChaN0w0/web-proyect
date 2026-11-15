import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const inicial = { nombre: "", fechaNacimiento: "", email: "", password: "", confirmarPassword: "" };

export default function Registro() {
  const [datos, setDatos] = useState(inicial);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const { registrar } = useAuth();

  const actualizar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setCargando(true);
    const res = await registrar(datos);
    setCargando(false);
    if (!res.ok) {
      setMensaje(res.error);
      return;
    }
    setMensaje("¡Registro exitoso! Ya puedes iniciar sesión.");
    setDatos(inicial);
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card p-4 p-md-5">
            <h2 className="text-center mb-4" style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue)" }}>
              CREAR UNA CUENTA
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre Completo</label>
                <input type="text" className="form-control" id="nombre" placeholder="Ej: Juan Pérez" required
                  value={datos.nombre} onChange={actualizar("nombre")} />
              </div>

              <div className="mb-3">
                <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento</label>
                <input type="date" className="form-control" id="fechaNacimiento" required
                  value={datos.fechaNacimiento} onChange={actualizar("fechaNacimiento")} />
                <small className="text-muted mt-1 d-block" style={{ fontSize: "0.8rem" }}>
                  Debes ser mayor de 18 años para registrarte.
                </small>
              </div>

              <div className="mb-3">
                <label htmlFor="correo" className="form-label">Correo Electrónico</label>
                <input type="email" className="form-control" id="correo" placeholder="ejemplo@correo.com" required
                  value={datos.email} onChange={actualizar("email")} />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input type="password" className="form-control" id="password" placeholder="********" required
                    value={datos.password} onChange={actualizar("password")} />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="confirmarPassword" className="form-label">Confirmar Contraseña</label>
                  <input type="password" className="form-control" id="confirmarPassword" placeholder="********" required
                    value={datos.confirmarPassword} onChange={actualizar("confirmarPassword")} />
                </div>
              </div>

              <p
                id="mensajeRegistro"
                className="text-center mt-3 fw-bold"
                style={{ color: mensaje.startsWith("Error") ? "#ff4d4d" : "var(--neon-green)" }}
              >
                {mensaje}
              </p>

              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-neon py-2" disabled={cargando}>
                  {cargando ? "REGISTRANDO..." : "REGISTRARSE"}
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="mb-0 text-muted">¿Ya tienes una cuenta?</p>
                <Link to="/login" style={{ color: "var(--primary-blue)", textDecoration: "none", fontWeight: "bold" }}>
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
