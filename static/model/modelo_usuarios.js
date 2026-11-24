
class ModeloUsuarios {
    constructor() {
        this.CLAVE = "zapcontrol.usuarios";
        this.roles = ["Administrador", "Empleado"];
        this.usuarios = this.cargar();
    }

    cargar() {
        try {
            const guardado = JSON.parse(localStorage.getItem(this.CLAVE));
            if (Array.isArray(guardado) && guardado.length) return guardado;
        } catch (e) { }
        const inicial = [
            { id: 1, nombre: "Administrador", usuario: "admin", password: "admin123", rol: "Administrador" },
            { id: 2, nombre: "Perla", usuario: "Perla", password: "Perla123", rol: "Empleado" },
            { id: 3, nombre: "David", usuario: "David", password: "David123", rol: "Empleado" }
        ];
        try { localStorage.setItem(this.CLAVE, JSON.stringify(inicial)); } catch (e) { }
        return inicial;
    }

    guardar() {
        try { localStorage.setItem(this.CLAVE, JSON.stringify(this.usuarios)); return true; }
        catch (e) { return false; }
    }

    obtenerUsuarios() { return this.usuarios; }

    autenticar(usuario, password) {
        return this.usuarios.find(u =>
            u.usuario.toLowerCase() === usuario.trim().toLowerCase() && u.password === password) || null;
    }

    obtenerPorId(id) { return this.usuarios.find(u => u.id === id); }

    existeUsuario(usuario, idIgnorado = null) {
        return this.usuarios.some(u => u.id !== idIgnorado && u.usuario.toLowerCase() === usuario.trim().toLowerCase());
    }

    totalAdministradores() { return this.usuarios.filter(u => u.rol === "Administrador").length; }

    registrarUsuario(nombre, usuario, password, rol) {
        const id = this.usuarios.reduce((m, u) => Math.max(m, u.id), 0) + 1;
        this.usuarios.push({ id, nombre, usuario, password, rol });
        this.guardar();
    }

    // datos: { nombre, usuario, password, rol }. Si password viene vacío se conserva la actual.
    actualizarUsuario(id, datos) {
        const u = this.obtenerPorId(id);
        if (!u) return { correcto: false, mensaje: "El usuario no existe." };
        if (!this.roles.includes(datos.rol)) return { correcto: false, mensaje: "Rol no válido." };
        if (this.existeUsuario(datos.usuario, id)) return { correcto: false, mensaje: "Ese usuario ya existe." };
        if (u.rol === "Administrador" && datos.rol !== "Administrador" && this.totalAdministradores() <= 1) {
            return { correcto: false, mensaje: "Debe existir al menos un administrador: no se puede cambiar el rol del único que hay." };
        }

        const anterior = { ...u };
        u.nombre = datos.nombre;
        u.usuario = datos.usuario.trim();
        if (datos.password) u.password = datos.password;
        u.rol = datos.rol;

        if (!this.guardar()) {
            Object.assign(u, anterior);
            return { correcto: false, mensaje: "No fue posible guardar los cambios." };
        }
        this.actualizarVentasDe(anterior.usuario, u);
        return { correcto: true, usuario: u, usuarioAnterior: anterior.usuario };
    }

    // Si cambia el nombre de usuario, sus ventas siguen siendo suyas
    actualizarVentasDe(usuarioAnterior, u) {
        try {
            const ventas = JSON.parse(localStorage.getItem("zapcontrol.ventas"));
            if (!Array.isArray(ventas)) return;
            let cambio = false;
            ventas.forEach(v => {
                if (v.vendedor === usuarioAnterior) { v.vendedor = u.usuario; v.nombreVendedor = u.nombre; cambio = true; }
            });
            if (cambio) localStorage.setItem("zapcontrol.ventas", JSON.stringify(ventas));
        } catch (e) { }
    }
}
