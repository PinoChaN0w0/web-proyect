

const productos = [
    {
        id: 1,
        nombre: "Catan",
        categoria: "Juegos de mesa",
        precio: 29990,
        emoji: "🎲",
        descripcion: "Juego de estrategia y aventura para disfrutar con amigos."
    },
    {
        id: 2,
        nombre: "Carcassonne",
        categoria: "Juegos de mesa",
        precio: 24990,
        emoji: "🏰",
        descripcion: "Juego de mesa de estrategia basado en la construcción de territorios."
    },
    {
        id: 3,
        nombre: "Controlador Xbox",
        categoria: "Accesorios",
        precio: 59990,
        emoji: "🎮",
        descripcion: "Controlador para disfrutar tus juegos favoritos con comodidad."
    },
    {
        id: 4,
        nombre: "HyperX Cloud II",
        categoria: "Accesorios",
        precio: 79990,
        emoji: "🎧",
        descripcion: "Audífonos gamer con sonido envolvente y micrófono integrado."
    },
    {
        id: 5,
        nombre: "PlayStation 5",
        categoria: "Consolas",
        precio: 549990,
        emoji: "🎮",
        descripcion: "Consola de nueva generación para disfrutar tus juegos favoritos."
    },
    {
        id: 6,
        nombre: "Notebook Gamer ASUS ROG",
        categoria: "Computadores Gamers",
        precio: 1299990,
        emoji: "🖥️",
        descripcion: "Computador gamer de alto rendimiento para videojuegos."
    },
    {
        id: 7,
        nombre: "Silla Secretlab Titan",
        categoria: "Sillas Gamers",
        precio: 349990,
        emoji: "💺",
        descripcion: "Silla gamer diseñada para entregar comodidad durante largas sesiones."
    },
    {
        id: 8,
        nombre: "Logitech G502 HERO",
        categoria: "Mouse",
        precio: 49990,
        emoji: "🖱️",
        descripcion: "Mouse gamer de alta precisión para tus partidas."
    },
    {
        id: 9,
        nombre: "Razer Goliathus",
        categoria: "Mousepad",
        precio: 29990,
        emoji: "⬛",
        descripcion: "Mousepad gamer diseñado para ofrecer precisión y control."
    },
    {
        id: 10,
        nombre: "Poleron Gamer",
        categoria: "Ropa",
        precio: 14990,
        emoji: "👕",
        descripcion: "QUIERES UN POLERON GAMER? ESTE ES EL TUYO, DISFRUTA DE LA COMODIDAD Y ESTILO CON ESTE POLERON GAMER. POR PARTE DE NUESTRO EQUIPO DE LEVEL-UP GAMER, TE RECOMENDAMOS ESTE POLERON PARA QUE LO LLEVES A TODAS PARTES."
    }
];



function formatearPrecio(precio) {
    return precio.toLocaleString("es-CL") + " CLP";
}
function mostrarProductos(listaProductos) {
    const contenedor =
        document.getElementById("products-container");

    const mensajeSinResultados =
        document.getElementById("no-results");

    contenedor.innerHTML = "";
    if (listaProductos.length === 0) {
        mensajeSinResultados.style.display = "block";
        return;
    }
    mensajeSinResultados.style.display = "none";
    listaProductos.forEach(producto => {
        const tarjeta =
            document.createElement("article");

        tarjeta.classList.add("product-card");
        tarjeta.innerHTML = `
            <div class="product-image">
                <span>
                    ${producto.emoji}
                </span>

            </div>
            <div class="product-info">
                <span class="product-category">
                    ${producto.categoria}
                </span>
                <h3>
                    ${producto.nombre}
                </h3>
                <p class="product-description">
                    ${producto.descripcion}
                </p>
                <p class="product-price">
                    ${formatearPrecio(producto.precio)}
                </p>
                <div class="product-actions">
                    <a
                        href="producto-detalle.html?id=${producto.id}"
                        class="product-button">
                        Ver producto
                    </a>
                    <button
                        class="add-cart-button"
                        onclick="agregarAlCarrito(${producto.id})">

                        <i class="fa-solid fa-cart-plus"></i>
                        Agregar
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });

}


function filtrarProductos() {
    const textoBusqueda =
        document
            .getElementById("search-input")
            .value
            .toLowerCase();

    const categoria =
        document
            .getElementById("category-filter")
            .value;

    const productosFiltrados =
        productos.filter(producto => {
            const coincideNombre =
                producto.nombre
                    .toLowerCase()
                    .includes(textoBusqueda);
            const coincideCategoria =
                categoria === "todos" ||
                producto.categoria === categoria;
            return coincideNombre && coincideCategoria;
        });
    mostrarProductos(productosFiltrados);
}




function agregarAlCarrito(idProducto) {
    const producto =
        productos.find(
            producto => producto.id === idProducto
        );

    if (!producto) {
        return;

    }

    let carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];

    const productoExistente =
        carrito.find(
            item => item.id === idProducto
        );

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            emoji: producto.emoji,
            cantidad: 1
        });
    }

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    actualizarContadorCarrito();
    alert(
        `${producto.nombre} fue agregado al carrito.`
    );
}

function actualizarContadorCarrito() {
    const contador =
        document.getElementById("cart-count");
    if (!contador) {
        return;
    }
    
    const carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];

    const cantidadTotal =
        carrito.reduce(
            (total, producto) =>
                total + producto.cantidad,
            0
        );
    contador.textContent =
        cantidadTotal;
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        // Mostrar productos al cargar
        mostrarProductos(productos);
        // Buscador de productos
        document
            .getElementById("search-input")
            .addEventListener(
                "input",
                filtrarProductos
            );
        // Filtro categoría
        document
            .getElementById("category-filter")
            .addEventListener(
                "change",
                filtrarProductos
            );
        // Actualizar contador
        actualizarContadorCarrito();
    }
);