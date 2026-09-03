document.addEventListener("DOMContentLoaded", () => {
    const formRegistro = document.getElementById("formRegistro");
    if (!formRegistro) return;

    // Referencias centralizadas del DOM
    const elementos = {
        nombre: document.getElementById("nombre"),
        fechaNacimiento: document.getElementById("fechaNacimiento"),
        email: document.getElementById("email"),
        password: document.getElementById("password"),
        confirmarPassword: document.getElementById("confirmarPassword"),
        mensajeError: document.getElementById("mensajeError")
    };

    // Funciones Auxiliares
    const mostrarMensaje = (texto, esExito = false) => {
        elementos.mensajeError.textContent = texto;
        elementos.mensajeError.style.color = esExito 
            ? "var(--neon-green, #39FF14)" 
            : "#ff4d4d";
    };

    const esMayorDeEdad = (fechaNacimientoStr) => {
        const fechaNac = new Date(fechaNacimientoStr);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        return edad >= 18;
    };

    const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Event Listener Principal
    formRegistro.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const datos = {
            nombre: elementos.nombre.value.trim(),
            fechaNacimiento: elementos.fechaNacimiento.value,
            email: elementos.email.value.trim(),
            password: elementos.password.value,
            confirmarPassword: elementos.confirmarPassword.value
        };

        // 1. Campos obligatorios
        if (Object.values(datos).some(valor => !valor)) {
            mostrarMensaje("Error: Todos los campos son obligatorios.");
            return;
        }

        // 2. Control de edad (R.1)
        if (!esMayorDeEdad(datos.fechaNacimiento)) {
            mostrarMensaje("Error: Debes ser mayor de 18 años para registrarte en Level-Up.");
            return;
        }

        // 3. Formato de correo (R.2)
        if (!esEmailValido(datos.email)) {
            mostrarMensaje("Error: Ingresa un formato de correo electrónico válido.");
            return;
        }

        // 4. Seguridad de contraseña
        if (datos.password.length < 6) {
            mostrarMensaje("Error: La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (datos.password !== datos.confirmarPassword) {
            mostrarMensaje("Error: Las contraseñas no coinciden.");
            return;
        }

        // 5. Registro exitoso y persistencia
        mostrarMensaje("¡Registro exitoso! Redirigiendo al inicio de sesión...", true);
        localStorage.setItem("nuevoUsuario", datos.email);

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    });
});