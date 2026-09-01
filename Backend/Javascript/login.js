// Esperamos a que todo el cod se cargue para ejecutar el script
document.addEventListener("DOMContentLoaded", function() {
    // esta weea es el formulario con todas las weas
    const formLogin = document.getElementById("formLogin");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const mensajeError = document.getElementById("mensajeError");

    formLogin.addEventListener("submit", function(evento) {

        evento.preventDefault(); 
        
        // Limpiamos mensajes anteriores
        mensajeError.textContent = "";
        mensajeError.style.color = "#FF0000"; // ROJO COMO EL FUEGO DE LA PASIÓN (O DE MI NOTAS)
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validacion 
        if (email === "" || password === "") {
            mensajeError.textContent = "Error: Todos los campos son obligatorios.";
            return; // Detiene la ejecución
        }

        // 3. Validación de formato de correo usando Expresiones Regulares
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(email)) {
            mensajeError.textContent = "Error: Ingresa un formato de correo válido.";
            return;
        }

        // Validación de longitud de contraseña
        if (password.length < 6) {
            mensajeError.textContent = "Error: La contraseña debe tener al menos 6 caracteres.";
            return;
        }

        // Simulación de Login Exitoso AUN NO TENGO SERVIDOR O CONECTADO A ALGUNA COSA, MATAME DIOS
        mensajeError.style.color = "#39FF14"; // Verde Neón (Color de la marca Level-Up)
        mensajeError.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";

        // Local stogare?, dio te  oiga mi rey
        localStorage.setItem("usuarioLogueado", "true");
        localStorage.setItem("correoUsuario", email);

        // Si el correo termina con @duocuc.cl o @duoc.cl, activamos el descuento, yo creo que entrarian mas judios al duoc si les damos descuento, pero bueno, no soy el dueño de la tienda
        if (email.endsWith("@duocuc.cl") || email.endsWith("@duoc.cl")) {
            localStorage.setItem("descuentoActivo", "true");
        } else {
            localStorage.setItem("descuentoActivo", "false");
        }

        // Redirigimos a la página principal después de 2 segundos
        setTimeout(() => {
            window.location.href = "index.html"; 
        }, 2000);
    });
});