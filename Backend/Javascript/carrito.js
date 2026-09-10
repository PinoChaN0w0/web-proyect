document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const tableContainer = document.querySelector('.table-responsive');
    const cartCount = document.getElementById('cart-count');
    const subtotalVal = document.getElementById('subtotal-val');
    const totalVal = document.getElementById('total-val');
    const btnVaciar = document.getElementById('btn-vaciar');

    if (!cartItemsContainer) return;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    function renderCarrito() {
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        if (cartCount) cartCount.textContent = totalItems;

        if (carrito.length === 0) {
            tableContainer.classList.add('d-none');
            emptyCartMsg.classList.remove('d-none');
            subtotalVal.textContent = '$0 CLP';
            totalVal.textContent = '$0 CLP';
            return;
        }

        tableContainer.classList.remove('d-none');
        emptyCartMsg.classList.add('d-none');
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        carrito.forEach((producto, index) => {
            const subtotalProducto = producto.precio * producto.cantidad;
            subtotal += subtotalProducto;

            const fila = document.createElement('tr');
            
            // Se actualizó esta sección para mostrar la imagen con el contenedor adaptado
            fila.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div style="width: 60px; height: 60px; margin-right: 15px; display: flex; justify-content: center; align-items: center; background-color: #fff; border-radius: 8px; overflow: hidden;">
                            <img src="${producto.imagen || ''}" alt="${producto.nombre}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.onerror=null; this.outerHTML='<span style=\\'font-size: 2rem;\\'>${producto.emoji || '🎮'}</span>';">
                        </div>
                        <div>
                            <h6 class="mb-0 text-white fw-bold">${producto.nombre}</h6>
                            <small style="color: var(--neon-green, #39FF14);">${producto.categoria || 'Gamer'}</small>
                        </div>
                    </div>
                </td>
                <td class="text-center text-light">$${producto.precio.toLocaleString('es-CL')}</td>
                <td>
                    <div class="d-flex justify-content-center align-items-center gap-2">
                        <button class="btn btn-outline-danger btn-sm btn-restar" data-index="${index}">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="text-white fw-bold px-2">${producto.cantidad}</span>
                        <button class="btn btn-outline-info btn-sm btn-sumar" data-index="${index}">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td class="text-end text-success fw-bold fs-6">$${subtotalProducto.toLocaleString('es-CL')}</td>
                <td class="text-center">
                    <button class="btn btn-link text-danger btn-eliminar p-0" data-index="${index}">
                        <i class="fa-solid fa-trash-can fs-5"></i>
                    </button>
                </td>
            `;
            cartItemsContainer.appendChild(fila);
        });

        subtotalVal.textContent = `$${subtotal.toLocaleString('es-CL')} CLP`;
        totalVal.textContent = `$${subtotal.toLocaleString('es-CL')} CLP`;

        asignarEventosBotones();
    }

    function asignarEventosBotones() {
        document.querySelectorAll('.btn-sumar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                carrito[index].cantidad++;
                guardarYRenderizar();
            });
        });

        document.querySelectorAll('.btn-restar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                if (carrito[index].cantidad > 1) {
                    carrito[index].cantidad--;
                } else {
                    carrito.splice(index, 1);
                }
                guardarYRenderizar();
            });
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                carrito.splice(index, 1);
                guardarYRenderizar();
            });
        });
    }

    function guardarYRenderizar() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderCarrito();
    }

    if (btnVaciar) {
        btnVaciar.addEventListener('click', () => {
            if(confirm('¿Estás seguro de vaciar tu carrito?')) {
                carrito = [];
                guardarYRenderizar();
            }
        });
    }

    renderCarrito();
});