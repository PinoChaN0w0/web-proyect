// imagen: ruta relativa a /public. Si es null se muestra el emoji.
export const productos = [
  { id: 1, nombre: "Catan", categoria: "Juegos de mesa", precio: 29990, emoji: "🎲", imagen: "ASSETS/Productos/catan.jpg", descripcion: "Juego de estrategia y aventura para disfrutar con amigos." },
  { id: 2, nombre: "Carcassonne", categoria: "Juegos de mesa", precio: 24990, emoji: "🏰", imagen: "ASSETS/Productos/CASCARSONNE.png", descripcion: "Juego de mesa de estrategia basado en la construcción de territorios." },
  { id: 3, nombre: "XBOX Controller", categoria: "Accesorios", precio: 59990, emoji: "🎮", imagen: null, descripcion: "Controlador para disfrutar tus juegos favoritos con comodidad." },
  { id: 4, nombre: "Corsair HS80 Wireless", categoria: "Accesorios", precio: 79990, emoji: "🎧", imagen: "ASSETS/Productos/HS80 Corsair.png", descripcion: "Audífonos gamer con sonido envolvente y micrófono integrado." },
  { id: 5, nombre: "PlayStation 5", categoria: "Consolas", precio: 549990, emoji: "🎮", imagen: null, descripcion: "Consola de nueva generación para disfrutar tus juegos favoritos." },
  { id: 6, nombre: "ASUS ROG G16", categoria: "Computadores Gamers", precio: 2299990, emoji: "🖥️", imagen: "ASSETS/Productos/ASUS ROG g16.png", descripcion: "Computador gamer de alto rendimiento para videojuegos." },
  { id: 7, nombre: "Silla Secretlab Titan", categoria: "Sillas Gamers", precio: 349990, emoji: "💺", imagen: "ASSETS/Productos/SecretLAB.png", descripcion: "Silla gamer diseñada para entregar comodidad durante largas sesiones." },
  { id: 8, nombre: "Logitech G PRO SUPERLIGHT 2", categoria: "Mouse", precio: 94990, emoji: "🖱️", imagen: "ASSETS/Productos/Superligth2.png", descripcion: "Mouse gamer de alta precisión para tus partidas." },
  { id: 9, nombre: "Razer Goliathus", categoria: "Mousepad", precio: 29990, emoji: "⬛", imagen: null, descripcion: "Mousepad gamer diseñado para ofrecer precisión y control." },
  { id: 10, nombre: "Poleron Gamer", categoria: "Ropa", precio: 14990, emoji: "👕", imagen: null, descripcion: "¿Quieres un polerón gamer? Este es el tuyo, disfruta de la comodidad y el estilo." },
];

// IDs mostrados en "Productos destacados" del inicio
export const idsDestacados = [5, 8, 4];

export const categorias = [...new Set(productos.map((p) => p.categoria))];
