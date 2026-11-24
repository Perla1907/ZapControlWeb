class ControladorProductos {
    constructor(modelo, params) {
        this.modelo = modelo;
        this.buscador = document.getElementById("buscarProducto");
        this.tabla = document.getElementById("tablaProductos");
        this.buscador.addEventListener("input", () => this.pintar());
        this.pintar();

        if (params.get("actualizado") === "1") {
            VistaComun.mensaje(document.getElementById("mensaje"), "Producto actualizado correctamente.", "exito");
        }
    }

    celdaAcciones(p) {
        const a = document.createElement("a");
        a.href = `editar-producto.html?id=${p.id}`;
        a.className = "btn";
        a.textContent = "Editar";
        const c = document.createElement("div");
        c.className = "text-end";
        c.appendChild(a);
        return c;
    }

    pintar() {
        const q = this.buscador.value.trim().toLowerCase();
        const lista = this.modelo.obtenerProductos().filter(p =>
            `${p.marca} ${p.modelo} ${p.categoria}`.toLowerCase().includes(q));
        VistaComun.llenarTabla(this.tabla,
            lista.map(p => [p.marca, p.modelo, p.categoria, VistaComun.dinero(p.precio), p.ubicacion,
                            VistaComun.insigniaStock(p.totalPares), this.celdaAcciones(p)]),
            7, "No hay productos que coincidan.");
    }
}
new ControladorProductos(new ModeloProductos(), new URLSearchParams(location.search));
