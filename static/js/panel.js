// Se incluye en todas las páginas del panel: valida la sesión, llena la barra y el menú
(function () {
    const sesion = Sesion.actual();
    if (!sesion) { location.replace("login.html"); return; }                 // sin sesión -> login
    if (document.body.hasAttribute("data-solo-admin") && sesion.rol !== "Administrador") {
        location.replace("dashboard.html");                                  // empleado en página de admin
        return;
    }
    document.getElementById("nombreUsuario").textContent = sesion.nombre;
    document.getElementById("rolUsuario").textContent = sesion.rol;
    document.querySelectorAll("[data-solo-admin]").forEach(el => { if (el !== document.body) el.hidden = sesion.rol !== "Administrador"; });
    document.getElementById("btnSalir").addEventListener("click", () => { Sesion.cerrar(); location.href = "Bienvenida.html"; });
    document.getElementById("btnMenu").addEventListener("click", () => document.body.classList.toggle("menu-abierto"));
})();
