document.addEventListener('DOMContentLoaded', () => {
    const contenedorCarro = document.querySelector('.container-carro');
    const cartCount = document.getElementById('cart-count');

    if (!contenedorCarro) return;

    // 1. Obtener carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Si el carrito no tiene productos, mostramos un producto de ejemplo (Catan) de tu lista
    if (carrito.length === 0) {
        carrito = [{
            id: 1,
            nombre: "Catan",
            categoria: "Juegos de mesa",
            precio: 29990,
            emoji: "🎲",
            descripcion: "Juego de estrategia y aventura para disfrutar con amigos.",
            cantidad: 1
        }];
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    // Tomamos SOLO el 1er producto para mantener la vista con un solo ítem
    let producto = carrito[0];

    // 2. Renderizar la interfaz utilizando tus emojis e información real
    contenedorCarro.innerHTML = `
        <div class="container my-5">
            <div class="row g-4">
                <!-- Tarjeta del Producto -->
                <div class="col-md-8">
                    <div class="card p-3" style="background-color: var(--bg-dark-card, #121212); border: 1px solid var(--primary-blue, #1E90FF);">
                        <div class="row g-0 align-items-center">
                            <div class="col-md-4 text-center p-2">
                                <span style="font-size: 80px;">${producto.emoji || '🎮'}</span>
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <span class="product-category" style="color: var(--neon-green, #39FF14); font-size: 11px; letter-spacing: 2px;">
                                        ${producto.categoria || 'PRODUCTO GAMER'}
                                    </span>
                                    <h5 class="card-title fw-bold text-white fs-4 mt-1">${producto.nombre}</h5>
                                    <p class="card-text text-muted">${producto.descripcion || ''}</p>
                                    <p class="card-text fw-bold fs-4" style="color: var(--neon-green, #39FF14);">$${producto.precio.toLocaleString('es-CL')} CLP</p>
                                    
                                    <div class="d-flex align-items-center gap-3 mt-3">
                                        <button id="btn-restar" class="btn btn-outline-danger btn-sm px-3">-</button>
                                        <span id="cantidad-producto" class="fw-bold fs-5 text-white">${producto.cantidad}</span>
                                        <button id="btn-sumar" class="btn btn-outline-info btn-sm px-3">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen de Compra -->
                <div class="col-md-4">
                    <div class="card p-4" style="background-color: var(--bg-dark-card, #121212); border: 1px solid var(--primary-blue, #1E90FF);">
                        <h4 class="card-title pb-2 border-bottom border-secondary text-white">Resumen de Compra</h4>
                        <div class="d-flex justify-content-between my-3 text-white">
                            <span>Cantidad:</span>
                            <strong id="resumen-cantidad">${producto.cantidad}</strong>
                        </div>
                        <div class="d-flex justify-content-between my-3 text-white fs-5">
                            <span>Total:</span>
                            <strong id="resumen-total" style="color: var(--neon-green, #39FF14);">$${(producto.cantidad * producto.precio).toLocaleString('es-CL')} CLP</strong>
                        </div>
                        <button id="btn-comprar" class="btn w-100 mt-3 btn-neon" ${producto.cantidad === 0 ? 'disabled' : ''}>Proceder al Pago</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 3. Referencias del DOM
    const btnSumar = document.getElementById('btn-sumar');
    const btnRestar = document.getElementById('btn-restar');
    const btnComprar = document.getElementById('btn-comprar');
    const cantidadProducto = document.getElementById('cantidad-producto');
    const resumenCantidad = document.getElementById('resumen-cantidad');
    const resumenTotal = document.getElementById('resumen-total');

    // 4. Actualización en tiempo real y sincronización con localStorage
    function actualizarCarrito() {
        // Actualizar datos en memoria y localStorage
        carrito[0].cantidad = producto.cantidad;
        localStorage.setItem('carrito', JSON.stringify(carrito));

        // Actualizar contador del Header y tarjeta
        if (cartCount) cartCount.textContent = producto.cantidad;
        cantidadProducto.textContent = producto.cantidad;
        resumenCantidad.textContent = producto.cantidad;

        // Calcular total
        const total = producto.cantidad * producto.precio;
        resumenTotal.textContent = `$${total.toLocaleString('es-CL')} CLP`;

        // Estado de botones
        btnRestar.disabled = producto.cantidad === 0;
        btnComprar.disabled = producto.cantidad === 0;
    }

    // 5. Controles de sumar y restar
    btnSumar.addEventListener('click', () => {
        producto.cantidad++;
        actualizarCarrito();
    });

    btnRestar.addEventListener('click', () => {
        if (producto.cantidad > 0) {
            producto.cantidad--;
            actualizarCarrito();
        }
    });

    // Carga inicial
    actualizarCarrito();
});