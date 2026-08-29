const login = document.getElementById("login");
const errorMessage = document.getElementById("error-message");

login.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = login.username.value;
    const password = login.password.value;
    if (!email || !password) {
        errorMessage.textContent = "Por favor, ingrese sus datos correctamente.";
        return;
    }
    // Aqui se hace la llamada a la API para verificar las credenciales del usuario
    errorMessage.textContent = "Iniciando sesión.";
    alert("Iniciando sesión.");
    // Aqui se supone que se mandaria el redirccionamiento a la pagina principal del usuario creo
 });    