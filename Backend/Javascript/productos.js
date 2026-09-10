const productos = [
    { id: 1, nombre: "Catan", categoria: "Juegos de mesa", precio: 29990, emoji: "🎲", imagen: "ASSETS/Productos/catan.jpg", descripcion: "Juego de estrategia y aventura para disfrutar con amigos." },
    { id: 2, nombre: "Carcassonne", categoria: "Juegos de mesa", precio: 24990, emoji: "🏰", imagen: "ASSETS/Productos/CASCARSONNE.png", descripcion: "Juego de mesa de estrategia basado en la construcción de territorios." },
    { id: 3, nombre: "XBOX Controller", categoria: "Accesorios", precio: 59990, emoji: "🎮", imagen: "ASSETS/Productos/", descripcion: "Controlador para disfrutar tus juegos favoritos con comodidad." },
    { id: 4, nombre: "Corsair HS80 Wireless", categoria: "Accesorios", precio: 79990, emoji: "🎧", imagen: "ASSETS/Productos/HS80 Corsair.png", descripcion: "Audífonos gamer con sonido envolvente y micrófono integrado." },
    { id: 5, nombre: "PlayStation 5", categoria: "Consolas", precio: 549990, emoji: "🎮", imagen: "ASSETS/Productos/", descripcion: "Consola de nueva generación para disfrutar tus juegos favoritos." },
    { id: 6, nombre: "ASUS ROG G16", categoria: "Computadores Gamers", precio: 2299990, emoji: "🖥️", imagen: "ASSETS/Productos/ASUS ROG g16.png", descripcion: "Computador gamer de alto rendimiento para videojuegos." },
    { id: 7, nombre: "Silla Secretlab Titan", categoria: "Sillas Gamers", precio: 349990, emoji: "💺", imagen: "ASSETS/Productos/SecretLAB.png", descripcion: "Silla gamer diseñada para entregar comodidad durante largas sesiones." },
    { id: 8, nombre: "Logitech G PRO SUPERLIGHT 2", categoria: "Mouse", precio: 94990, emoji: "🖱️", imagen: "ASSETS/Productos/Superligth2.png", descripcion: "Mouse gamer de alta precisión para tus partidas." },
    { id: 9, nombre: "Razer Goliathus", categoria: "Mousepad", precio: 29990, emoji: "⬛", imagen: "ASSETS/Productos/", descripcion: "Mousepad gamer diseñado para ofrecer precisión y control." },
    { id: 10, nombre: "Poleron Gamer", categoria: "Ropa", precio: 14990, emoji: "👕", imagen: "ASSETS/Productos/", descripcion: "QUIERES UN POLERON GAMER? ESTE ES EL TUYO, DISFRUTA DE LA COMODIDAD Y ESTILO CON ESTE POLERON GAMER..." }
];

const formatearPrecio = (precio) => `${precio.toLocaleString("es-CL")} CLP`;

function mostrarProductos(lista) {
    const contenedor = document.getElementById("products-container");
    const msj = document.getElementById("no-results");

    msj.style.display = lista.length ? "none" : "block";

    contenedor.innerHTML = lista.map(p => `
        <article class="product-card">
            <div class="product-image" style="display: flex; justify-content: center; align-items: center; padding: 15px; background: #fff; border-radius: 8px 8px 0 0;">
                <img src="${p.imagen}" alt="${p.nombre}" style="max-width: 100%; max-height: 200px; object-fit: contain;" onerror="this.onerror=null; this.outerHTML='<span style=\\'font-size: 5rem;\\'>${p.emoji}</span>';">
            </div>
            <div class="product-info">
                <span class="product-category">${p.categoria}</span>
                <h3>${p.nombre}</h3>
                <p class="product-description">${p.descripcion}</p>
                <p class="product-price">${formatearPrecio(p.precio)}</p>
                <div class="product-actions">
                    <a href="producto-detalle.html?id=${p.id}" class="product-button">Ver producto</a>
                    <button class="add-cart-button" onclick="agregarAlCarrito(${p.id})">
                        <i class="fa-solid fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

function filtrarProductos() {
    const texto = document.getElementById("search-input").value.toLowerCase();
    const cat = document.getElementById("category-filter").value;

    mostrarProductos(productos.filter(p => 
        p.nombre.toLowerCase().includes(texto) && (cat === "todos" || p.categoria === cat)
    ));
}

function agregarAlCarrito(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return;

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let item = carrito.find(x => x.id === id);

    // Operador ternario y spread syntax para optimizar la inserción
    item ? item.cantidad++ : carrito.push({ ...p, cantidad: 1 });

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert(`${p.nombre} fue agregado al carrito.`);
}

function actualizarContadorCarrito() {
    const contador = document.getElementById("cart-count");
    if (contador) {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        contador.textContent = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    mostrarProductos(productos);
    document.getElementById("search-input").addEventListener("input", filtrarProductos);
    document.getElementById("category-filter").addEventListener("change", filtrarProductos);
    actualizarContadorCarrito();
});