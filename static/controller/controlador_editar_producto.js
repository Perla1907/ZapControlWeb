// Editar producto: datos generales, existencias por variante, variantes nuevas y quitar variantes sin ventas
class ControladorEditarProducto extends ControladorNuevoProducto {
    constructor(modelo, vista, params) {
        super(modelo, vista);

        this.id = Number(params.get("id"));
        this.producto = modelo.obtenerPorId(this.id);
        if (!this.producto) {
            location.replace("productos.html");
            return;
        }

        vista.cargarProducto(this.producto);
        this.variantes = this.producto.variantes.map(v => ({ ...v }));
        this.variantes.forEach(v => {
            if (!modelo.obtenerColores().some(c => c.nombre === v.color)) modelo.agregarColor(v.color, "#cccccc");
        });
        vista.cargarColores(modelo);
        vista.alCambiarStock = (i, valor) => this.cambiarStock(i, valor);
        this.redibujar();
    }

    redibujar() {
        this.vista.dibujarVariantes(this.variantes, this.modelo, i => this.quitar(i));
    }

    cambiarStock(i, valor) {
        this.variantes[i].existencias = valor === "" ? "" : Number(valor);
        this.vista.actualizarTotales(this.variantes);
    }

    quitar(i) {
        const v = this.variantes[i];
        if (v.sku && this.modelo.skusVendidos().has(v.sku)) {
            this.vista.avisarVariante(`No se puede quitar ${v.color} · talla ${v.talla}: ya tiene ventas. Déjala en 0 existencias.`, "error");
            return;
        }
        this.variantes.splice(i, 1);
        this.redibujar();
    }

    // Las variantes nuevas se agregan con el método heredado; solo hay que redibujar con el editor de existencias
    agregarVariante() {
        super.agregarVariante();
        this.redibujar();
    }

    guardar(e) {
        e.preventDefault();
        const v = this.vista;
        v.limpiarError();
        const d = v.datos();

        if (!d.marca || !d.modelo || !d.categoria || !d.precio || !d.ubicacion) {
            return v.mostrarError("Marca, modelo, categoría, precio y ubicación son obligatorios.");
        }
        const precio = Number(d.precio);
        if (!Number.isFinite(precio) || precio <= 0) {
            return v.mostrarError("El precio debe ser un número mayor que cero.");
        }
        d.precio = precio;

        if (this.variantes.length === 0) {
            return v.mostrarError("El producto debe tener al menos una variante.");
        }
        const invalida = this.variantes.find(x => !Number.isInteger(Number(x.existencias)) || Number(x.existencias) < 0 || x.existencias === "");
        if (invalida) {
            return v.mostrarError(`Las existencias de ${invalida.color} · talla ${invalida.talla} deben ser un entero igual o mayor a cero.`);
        }

        const r = this.modelo.actualizarProducto(this.id, d, this.variantes);
        if (!r.correcto) return v.mostrarError(r.mensaje);
        location.href = "productos.html?actualizado=1";
    }
}
new ControladorEditarProducto(new ModeloProductos(), new VistaEditarProducto(), new URLSearchParams(location.search));
