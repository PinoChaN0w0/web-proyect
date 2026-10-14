import { useState } from "react";

const estilos = {
  card: {
    wrapper: { display: "flex", justifyContent: "center", alignItems: "center", padding: 15, background: "#fff", borderRadius: "8px 8px 0 0" },
    img: { maxWidth: "100%", maxHeight: 200, objectFit: "contain" },
    emoji: "5rem",
  },
  thumb: {
    wrapper: { width: 60, height: 60, marginRight: 15, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", flexShrink: 0 },
    img: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" },
    emoji: "2rem",
  },
};

/** Muestra la imagen del producto; si no existe o falla al cargar, muestra el emoji. */
export default function ProductImage({ producto, variant = "card" }) {
  const [fallo, setFallo] = useState(false);
  const e = estilos[variant];
  const src = producto.imagen ? `${import.meta.env.BASE_URL}${producto.imagen}` : null;

  return (
    <div className={variant === "card" ? "product-image" : undefined} style={e.wrapper}>
      {src && !fallo ? (
        <img src={src} alt={producto.nombre} style={e.img} onError={() => setFallo(true)} />
      ) : (
        <span style={{ fontSize: e.emoji }}>{producto.emoji || "🎮"}</span>
      )}
    </div>
  );
}
