import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Productos from "./pages/Productos.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Carrito from "./pages/Carrito.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import Proximamente from "./pages/Proximamente.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Productos />} />
        <Route path="productos/:id" element={<ProductoDetalle />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        {/* Páginas enlazadas en el sitio original pero que aún no existían */}
        <Route path="nosotros" element={<Proximamente titulo="Nosotros" />} />
        <Route path="blogs" element={<Proximamente titulo="Blogs" />} />
        <Route path="contacto" element={<Proximamente titulo="Contacto" />} />
        <Route path="*" element={<Proximamente titulo="Página no encontrada" />} />
      </Route>
    </Routes>
  );
}
