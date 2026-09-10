document.addEventListener("DOMContentLoaded", () => {

    const formRegistro = document.getElementById("formRegistro");
    if (!formRegistro) return;
    const elementos = {
        nombre: document.getElementById("nombre"),
        fechaNacimiento: document.getElementById("fechaNacimiento"),
        email: document.getElementById("email"),
        password: document.getElementById("password"),
        confirmarPassword: document.getElementById("confirmarPassword"),
        mensajeError: document.getElementById("mensajeError")
    };

    // MOSTRAR MENSAJE

    function mostrarMensaje(texto, esExito = false) {
        elementos.mensajeError.textContent = texto;
        elementos.mensajeError.style.color =
            esExito ? "#39FF14" : "#ff4d4d";
    }

    // VALIDAR EDAD

    function esMayorDeEdad(fechaNacimientoStr) {
        const fechaNacimiento = new Date(fechaNacimientoStr);
        const hoy = new Date();
        let edad =
            hoy.getFullYear() - fechaNacimiento.getFullYear();
        const diferenciaMes =
            hoy.getMonth() - fechaNacimiento.getMonth();
        if (
            diferenciaMes < 0 ||
            (
                diferenciaMes === 0 &&
                hoy.getDate() < fechaNacimiento.getDate()
            )
        ) {
            edad--;
        }
        return edad >= 18;
    }

    // VALIDAR EMAIL

    function esEmailValido(email) {
        const regexCorreo =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexCorreo.test(email);
    }

    // REGISTRO

    formRegistro.addEventListener("submit", (evento) => {

        evento.preventDefault();
        const datos = {
            nombre:
                elementos.nombre.value.trim(),
            fechaNacimiento:
            elementos.fechaNacimiento.value,
            email:
                elementos.email.value.trim().toLowerCase(),
            password:
            elementos.password.value,
            confirmarPassword:
            elementos.confirmarPassword.value
        };

        // CAMPOS VACÍOS

        if (Object.values(datos).some(valor => !valor)) {
            mostrarMensaje(
                "Error: Todos los campos son obligatorios."
            );
            return;
        }

        // VALIDAR EDAD

        if (!esMayorDeEdad(datos.fechaNacimiento)) {
            mostrarMensaje(
                "Error: Debes ser mayor de 18 años para registrarte."
            );
            return;
        }

        // VALIDAR EMAIL

        if (!esEmailValido(datos.email)) {
            mostrarMensaje(
                "Error: Ingresa un correo electrónico válido."
            );
            return;
        }

        // VALIDAR CONTRASEÑA

        if (datos.password.length < 6) {
            mostrarMensaje(
                "Error: La contraseña debe tener al menos 6 caracteres."
            );
            return;
        }
        if (datos.password !== datos.confirmarPassword) {
            mostrarMensaje(
                "Error: Las contraseñas no coinciden."
            );
            return;
        }

        // OBTENER USUARIOS EXISTENTES

        const usuarios =
            JSON.parse(localStorage.getItem("usuarios")) || [];

        // COMPROBAR SI EL CORREO YA ESTÁ REGISTRADO

        const usuarioExiste =
            usuarios.find(
                usuario =>
                    usuario.email === datos.email
            );

        if (usuarioExiste) {
            mostrarMensaje(
                "Error: Este correo ya está registrado."
            );
            return;
        }

        // CREAR NUEVO USUARIO

        const nuevoUsuario = {
            nombre:
            datos.nombre,
            fechaNacimiento:
            datos.fechaNacimiento,
            email:
            datos.email,
            password:
            datos.password
        };

        // AGREGAR USUARIO

        usuarios.push(nuevoUsuario);

        // GUARDAR USUARIOS EN LOCAL STORAGE

        localStorage.setItem(
            "usuarios",
            JSON.stringify(usuarios)
        );

        // MENSAJE DE ÉXITO

        mostrarMensaje(
            "¡Registro exitoso! Redirigiendo al inicio de sesión...",
            true
        );

        // IR AL LOGIN

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    });
});