// Esperamos a que todo el cod se cargue para ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
    const formLogin =
        document.getElementById("formLogin");
    const emailInput =
        document.getElementById("email");
    const passwordInput =
        document.getElementById("password");
    const mensajeError =
        document.getElementById("mensajeError");

    // INICIAR SESIÓN

    formLogin.addEventListener("submit", (evento) => {
        evento.preventDefault();

        // OBTENER DATOS DEL FORMULARIO

        const email =
            emailInput.value.trim().toLowerCase();
        const password =
            passwordInput.value.trim();

        // LIMPIAR MENSAJE ANTERIOR

        mensajeError.textContent = "";
        mensajeError.style.color = "#ff4d4d";

        // VALIDAR CAMPOS VACÍOS

        if (email === "" || password === "") {

            mensajeError.textContent =
                "Error: Todos los campos son obligatorios.";

            return;
        }

        // OBTENER USUARIOS DEL LOCAL STORAGE

        const usuarios =
            JSON.parse(
                localStorage.getItem("usuarios")
            ) || [];

        // BUSCAR USUARIO

        const usuarioEncontrado =
            usuarios.find(
                usuario =>
                    usuario.email === email &&
                    usuario.password === password
            );

        // COMPROBAR USUARIO

        if (!usuarioEncontrado) {

            mensajeError.textContent =
                "Error: Correo o contraseña incorrectos.";

            return;
        }

        // LOGIN EXITOSO

        mensajeError.style.color = "#39FF14";
        mensajeError.textContent =
            "¡Inicio de sesión exitoso! Redirigiendo...";

        // GUARDAR SESIÓN

        localStorage.setItem(
            "usuarioLogueado",
            "true"
        );

        // GUARDAR USUARIO ACTUAL

        localStorage.setItem(
            "usuarioActual",
            JSON.stringify({
                nombre: usuarioEncontrado.nombre,
                email: usuarioEncontrado.email
            })
        );

        // GUARDAR CORREO

        localStorage.setItem(
            "correoUsuario",
            email
        );

        // DESCUENTO DUOC

        if (
            email.endsWith("@duocuc.cl") ||
            email.endsWith("@duoc.cl")
        ) {
            localStorage.setItem(
                "descuentoActivo",
                "true"
            );
        } else {
            localStorage.setItem(
                "descuentoActivo",
                "false"
            );
        }

        // REDIRIGIR AL INICIO

        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    });
});