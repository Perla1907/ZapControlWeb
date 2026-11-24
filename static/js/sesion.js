class Sesion {
    static iniciar(usuario) {
        sessionStorage.setItem("zapcontrol.sesion",
            JSON.stringify({ usuario: usuario.usuario, nombre: usuario.nombre, rol: usuario.rol }));
    }
    static actual() {
        try { return JSON.parse(sessionStorage.getItem("zapcontrol.sesion")); } catch (e) { return null; }
    }
    static cerrar() { sessionStorage.removeItem("zapcontrol.sesion"); }
    static esAdmin() { const s = Sesion.actual(); return !!s && s.rol === "Administrador"; }
}
