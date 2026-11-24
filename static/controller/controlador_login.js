// Pantalla de login (login.html): valida contra ModeloUsuarios y abre la sesión
class ControladorLogin {
    constructor(modelo) {
        this.modelo = modelo;
        this.formulario = document.getElementById("formLoginZap");
        this.error = document.getElementById("errorLogin");
        if (Sesion.actual()) { location.replace("dashboard.html"); return; }   // ya había sesión
        this.formulario.addEventListener("submit", e => this.entrar(e));
    }

    entrar(e) {
        e.preventDefault();
        const usuario = document.getElementById("usuarioCorreoLogin").value;
        const password = document.getElementById("contrasena").value;
        const encontrado = this.modelo.autenticar(usuario, password);
        if (!encontrado) {
            this.error.textContent = "Usuario o contraseña incorrectos.";
            this.error.hidden = false;
            return;
        }
        Sesion.iniciar(encontrado);
        location.href = "dashboard.html";
    }
}
document.addEventListener("DOMContentLoaded", () => new ControladorLogin(new ModeloUsuarios()));
