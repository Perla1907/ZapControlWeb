// Editar usuario: solo el administrador (la página lleva data-solo-admin y aquí se vuelve a comprobar)
class ControladorEditarUsuario {
    constructor(modelo, params) {
        this.modelo = modelo;
        this.$ = id => document.getElementById(id);

        if (!Sesion.esAdmin()) { location.replace("dashboard.html"); return; }

        this.id = Number(params.get("id"));
        this.usuario = modelo.obtenerPorId(this.id);
        if (!this.usuario) { location.replace("usuarios.html"); return; }

        this.$("nombreEditar").value = this.usuario.nombre;
        this.$("usuarioEditar").value = this.usuario.usuario;
        this.$("rolEditar").value = this.usuario.rol;
        this.$("formEditarUsuario").addEventListener("submit", e => this.guardar(e));
    }

    guardar(e) {
        e.preventDefault();
        const aviso = this.$("avisoEditar");
        const nombre = this.$("nombreEditar").value.trim();
        const usuario = this.$("usuarioEditar").value.trim();
        const password = this.$("passwordEditar").value;
        const rol = this.$("rolEditar").value;

        if (!nombre || !usuario) return VistaComun.mensaje(aviso, "El nombre y el usuario son obligatorios.", "error");
        if (password && password.length < 6) return VistaComun.mensaje(aviso, "La contraseña debe tener al menos 6 caracteres.", "error");

        const r = this.modelo.actualizarUsuario(this.id, { nombre, usuario, password, rol });
        if (!r.correcto) return VistaComun.mensaje(aviso, r.mensaje, "error");

        // Si el administrador se editó a sí mismo, la sesión debe reflejar los cambios
        const sesion = Sesion.actual();
        if (sesion && sesion.usuario === r.usuarioAnterior) {
            Sesion.iniciar(r.usuario);
            if (r.usuario.rol !== "Administrador") { location.href = "dashboard.html"; return; }
        }
        location.href = "usuarios.html?actualizado=1";
    }
}
new ControladorEditarUsuario(new ModeloUsuarios(), new URLSearchParams(location.search));
