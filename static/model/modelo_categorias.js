class ModeloCategorias {
    constructor() {
        this.CLAVE = "zapcontrol.categorias";
        this.colores = ["#1565c0", "#2e9e6b", "#e8a020", "#d64545", "#8e6bbf", "#8a5a2b"];
        this.categorias = this.cargar();
    }

    cargar() {
        try {
            const guardado = JSON.parse(localStorage.getItem(this.CLAVE));
            if (Array.isArray(guardado)) return guardado;
        } catch (e) { }

        return [
            { id: 1, nombre: "Tenis",     descripcion: "Tenis deportivos y urbanos",    color: "#1565c0", productos: 2 },
            { id: 2, nombre: "Botas",     descripcion: "Botas de trabajo y casuales",   color: "#8a5a2b", productos: 1 },
            { id: 3, nombre: "Formal",    descripcion: "Zapatos de vestir",             color: "#1c1c1c", productos: 1 },
            { id: 4, nombre: "Casual",    descripcion: "Mocasines y calzado de diario", color: "#b07a2e", productos: 1 },
            { id: 5, nombre: "Sandalias", descripcion: "Calzado de temporada",          color: "#d2b48c", productos: 1 }
        ];
    }

    guardar() {
        try { localStorage.setItem(this.CLAVE, JSON.stringify(this.categorias)); } catch (e) { }
    }

    obtenerCategorias() { return this.categorias; }

    obtenerPorId(id) { return this.categorias.find(c => c.id === id); }

    existeNombre(nombre, idIgnorado = null) {
        return this.categorias.some(
            c => c.id !== idIgnorado && c.nombre.toLowerCase() === nombre.toLowerCase()
        );
    }

    registrarCategoria(nombre, descripcion, color) {
        const id = this.categorias.reduce((max, c) => Math.max(max, c.id), 0) + 1;
        this.categorias.push({ id, nombre, descripcion, color, productos: 0 });
        this.guardar();
    }

    actualizarCategoria(id, nombre, descripcion, color) {
        const categoria = this.obtenerPorId(id);
        if (!categoria) return;
        categoria.nombre = nombre;
        categoria.descripcion = descripcion;
        categoria.color = color;
        this.guardar();
    }

    puedeEliminar(id) {
        const categoria = this.obtenerPorId(id);
        return !!categoria && categoria.productos === 0;
    }

    eliminarCategoria(id) {
        if (!this.puedeEliminar(id)) return false;
        this.categorias = this.categorias.filter(c => c.id !== id);
        this.guardar();
        return true;
    }
}