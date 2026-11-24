class ControladorInventario {
    constructor(modelo) {
        this.modelo = modelo;
        this.buscador = document.getElementById("buscarInventario");
        this.tabla = document.getElementById("tablaInventario");
        this.buscador.addEventListener("input", () => this.pintar());
        this.pintar();
    }

    pintar() {
        const q = this.buscador.value.trim().toLowerCase();
        const lista = this.modelo.variantesPlanas().filter(v =>
            `${v.producto} ${v.color} ${v.sku} ${v.codigoBarras}`.toLowerCase().includes(q));
        VistaComun.llenarTabla(this.tabla,
            lista.map(v => [v.producto, v.categoria, v.color, v.talla, v.sku, v.codigoBarras,
                            v.ubicacion, VistaComun.insigniaStock(v.existencias)]),
            8, "No hay variantes que coincidan.");
    }
}
new ControladorInventario(new ModeloProductos());
