// Usuarios: el administrador ve la lista y da de alta empleados (u otros administradores)
class ControladorUsuarios {
    constructor(modelo, params) {
        this.modelo = modelo;
        this.$ = id => document.getElementById(id);
        this.$("formUsuario").addEventListener("submit", e => this.agregar(e));
        this.pintar();
        if (params.get("actualizado") === "1") VistaComun.mensaje(this.$("mensaje"), "Usuario actualizado correctamente.", "exito");
    }

    celdaAcciones(u) {
        const a = document.createElement("a");
        a.href = `editar-usuario.html?id=${u.id}`;
        a.className = "btn";
        a.textContent = "Editar";
        const c = document.createElement("div");
        c.className = "text-end";
        c.appendChild(a);
        return c;
    }

    pintar() {
        VistaComun.llenarTabla(this.$("tablaUsuarios"),
            this.modelo.obtenerUsuarios().map(u => [u.nombre, u.usuario, u.rol, this.celdaAcciones(u)]),
            4, "No hay usuarios registrados.");
    }

    agregar(e) {
        e.preventDefault();
        const nombre = this.$("nombreNuevo").value.trim();
        const usuario = this.$("usuarioNuevo").value.trim();
        const password = this.$("passwordNuevo").value;
        const rol = this.$("rolNuevo").value;
        const aviso = this.$("avisoUsuario");

        if (!nombre || !usuario || !password) return VistaComun.mensaje(aviso, "Todos los campos son obligatorios.", "error");
        if (password.length < 6) return VistaComun.mensaje(aviso, "La contraseña debe tener al menos 6 caracteres.", "error");
        if (this.modelo.existeUsuario(usuario)) return VistaComun.mensaje(aviso, "Ese usuario ya existe.", "error");

        this.modelo.registrarUsuario(nombre, usuario, password, rol);
        this.$("formUsuario").reset();
        VistaComun.mensaje(aviso, `Usuario «${usuario}» registrado como ${rol}.`, "exito");
        this.pintar();
    }
}
new ControladorUsuarios(new ModeloUsuarios(), new URLSearchParams(location.search));
