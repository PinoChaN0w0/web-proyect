import { Link } from "react-router-dom";

export default function Proximamente({ titulo }) {
  return (
    <main className="container my-5 text-center">
      <h2 style={{ fontFamily: "var(--font-orbitron)", color: "var(--primary-blue)" }}>{titulo}</h2>
      <p className="text-muted my-4">Esta sección estará disponible próximamente.</p>
      <Link to="/" className="btn btn-neon">Volver al inicio</Link>
    </main>
  );
}
