document.addEventListener("DOMContentLoaded", function() {
    
    const formRegistro = document.getElementById("formRegistro");
        if (formRegistro) {
        const nombreInput = document.getElementById("nombre");
        const fechaNacimientoInput = document.getElementById("fechaNacimiento");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const confirmarPasswordInput = document.getElementById("confirmarPassword");
        const mensajeError = document.getElementById("mensajeError");

        formRegistro.addEventListener("submit", function(evento) {
            
            // 1. Evitar que la página se recargue
            evento.preventDefault(); 
            
            // Limpiamos mensajes
            mensajeError.textContent = "";
            mensajeError.style.color = "#FF0000"; 

            const nombre = nombreInput.value.trim();
            const fechaNacimiento = fechaNacimientoInput.value;
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmarPassword = confirmarPasswordInput.value.trim();

            if (nombre === "" || fechaNacimiento === "" || email === "" || password === "" || confirmarPassword === "") {
                mensajeError.textContent = "Error: Todos los campos son obligatorios.";
                return;
            }

            const fechaNac = new Date(fechaNacimiento);
            const hoy = new Date();
            let edad = hoy.getFullYear() - fechaNac.getFullYear();
            const mes = hoy.getMonth() - fechaNac.getMonth();
            
            if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
                edad--;
            }

            if (edad < 18) {
                mensajeError.textContent = "Error: Según las reglas de Level-Up, debes ser mayor de 18 años para registrarte.";
                return; 
            }

            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(email)) {
                mensajeError.textContent = "Error: Ingresa un formato de correo válido.";
                return;
            }

            if (password !== confirmarPassword) {
                mensajeError.textContent = "Error: Las contraseñas no coinciden.";
                return;
            }

            if (password.length < 6) {
                mensajeError.textContent = "Error: La contraseña debe tener al menos 6 caracteres.";
                return;
            }

            mensajeError.style.color = "#39FF14"; // Verde Neón
            mensajeError.textContent = "¡Registro exitoso! Redirigiendo al inicio de sesión...";

            localStorage.setItem("nuevoUsuario", email);

            setTimeout(() => {
                window.location.href = "login.html"; 
            }, 2000);
        });
    }
});