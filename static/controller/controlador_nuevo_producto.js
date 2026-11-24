class ControladorNuevoProducto {
    constructor(modelo, vista) {
        this.modelo = modelo;
        this.vista = vista;
        this.variantes = [];

        vista.cargarCatalogos(modelo);
        vista.dibujarVariantes(this.variantes, modelo, i => this.quitar(i));

        vista.formulario.addEventListener("submit", e => this.guardar(e));
        vista.btnAgregarVariante.addEventListener("click", () => this.agregarVariante());
        vista.btnNuevoColor.addEventListener("click", () => vista.alternarPanelColor(!vista.panelColorAbierto()));
        vista.btnCancelarColor.addEventListener("click", () => vista.alternarPanelColor(false));
        vista.btnGuardarColor.addEventListener("click", () => this.guardarColor());
        vista.colorNombre.addEventListener("keydown", e => {
            if (e.key === "Enter") { e.preventDefault(); this.guardarColor(); }
            if (e.key === "Escape") vista.alternarPanelColor(false);
        });
        vista.precio.addEventListener("focus", () => vista.quitarFormatoPrecio());
        vista.precio.addEventListener("blur", () => vista.formatearPrecio());
        if (vista.btnImprimir) vista.btnImprimir.addEventListener("click", () => window.print());
    }

    guardarColor() {
        const v = this.vista;
        const nombre = v.colorNombre.value.trim();
        if (!nombre) { v.avisarVariante("Escribe el nombre del color.", "error"); v.colorNombre.focus(); return; }
        if (this.modelo.existeColor(nombre)) {
            v.avisarVariante(`El color «${nombre}» ya existe.`, "error");
            v.colorNombre.focus();
            return;
        }
        const guardado = this.modelo.agregarColor(nombre, v.colorMuestra.value);
        v.cargarColores(this.modelo, guardado);
        v.alternarPanelColor(false);
        v.avisarVariante(`Color «${guardado}» agregado y seleccionado.`);
        v.existencias.focus();
    }

    agregarVariante() {
        const v = this.vista;
        const color = v.color.value, talla = v.talla.value;
        const existencias = Number(v.existencias.value);

        if (!color || !talla) { v.avisarVariante("Elige color y talla.", "error"); return; }
        if (!Number.isInteger(existencias) || existencias <= 0) {
            v.avisarVariante("Las existencias deben ser un entero mayor que cero.", "error"); return;
        }
        if (this.variantes.some(x => x.color === color && x.talla === talla)) {
            v.avisarVariante("Esa combinación de color y talla ya está agregada.", "error"); return;
        }

        this.variantes.push({ color, talla, existencias });
        v.dibujarVariantes(this.variantes, this.modelo, i => this.quitar(i));
        v.existencias.value = "";
        v.avisarVariante("Variante agregada.");
        v.limpiarError();
    }

    quitar(i) {
        this.variantes.splice(i, 1);
        this.vista.dibujarVariantes(this.variantes, this.modelo, j => this.quitar(j));
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
            return v.mostrarError("Agrega al menos una variante con el botón «+ Agregar variante».");
        }

        const r = this.modelo.registrarProducto(d, this.variantes);
        if (!r.correcto) return v.mostrarError(r.mensaje);

        const n = r.producto.variantes.length;
        v.mostrarEtiqueta(r.producto);
        v.mostrarToast(`Producto guardado · ${n} ${n === 1 ? "variante" : "variantes"}`);
    }
}

// En la pantalla de edición este archivo solo aporta la clase base
if (document.getElementById("etiquetaCaja")) new ControladorNuevoProducto(new ModeloProductos(), new VistaNuevoProducto());