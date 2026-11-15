import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, admin = false }) {
  const { estaLogueado, esAdmin } = useAuth();

  if (!estaLogueado) return <Navigate to="/login" replace />;
  if (admin && !esAdmin) return <Navigate to="/" replace />;
  return children;
}
