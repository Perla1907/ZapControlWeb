// Nueva venta (y edición con ?id=): buscar/escanear, armar el carrito y cobrar
class ControladorNuevaVenta {
    constructor(ventas, productos, sesion, params) {
        this.ventas = ventas;
        this.productos = productos;
        this.sesion = sesion;
        this.$ = id => document.getElementById(id);

        this.id = params.has("id") ? Number(params.get("id")) : null;
        this.original = this.id ? this.ventas.obtenerPorId(this.id) : null;
        if (this.id && (!this.original || !this.ventas.puedeVer(this.original, this.sesion))) {
            location.replace("ventas.html");
            return;
        }

        this.carrito = this.original ? this.original.items.map(i => ({ sku: i.sku, cantidad: i.cantidad })) : [];

        this.llenarMetodosPago();
        if (this.original) {
            this.$("tituloPagina").textContent = `Editar venta ${this.original.folio}`;
            this.$("btnCobrar").textContent = "Guardar cambios";
            this.$("metodoPago").value = this.original.metodoPago;
        }

        this.$("buscarVariante").addEventListener("input", () => this.pintarResultados());
        this.$("buscarVariante").addEventListener("keydown", e => this.alTeclear(e));
        this.$("resultados").addEventListener("click", e => {
            const b = e.target.closest("button[data-sku]");
            if (b) this.agregar(b.dataset.sku);
        });
        this.$("carrito").addEventListener("click", e => this.alHacerClicCarrito(e));
        this.$("btnCobrar").addEventListener("click", () => this.cobrar());

        this.pintarResultados();
        this.pintarCarrito();
        this.$("buscarVariante").focus();
    }

    llenarMetodosPago() {
        const select = this.$("metodoPago");
        this.ventas.metodosPago.forEach(m => select.appendChild(new Option(m, m)));
    }

    aviso(texto, tipo) { VistaComun.mensaje(this.$("avisoVenta"), texto, tipo); }
    limpiarAviso() { this.$("avisoVenta").textContent = ""; this.$("avisoVenta").className = ""; }

    /* ---------- Existencias ---------- */

    variante(sku) { return this.productos.variantesPlanas().find(v => v.sku === sku); }

    // Lo que hay + lo que esta misma venta ya tenía apartado (al editar)
    disponible(sku) {
        const v = this.variante(sku);
        if (!v) return 0;
        const previo = this.original
            ? this.original.items.filter(i => i.sku === sku).reduce((t, i) => t + i.cantidad, 0) : 0;
        return v.existencias + previo;
    }

    enCarrito(sku) {
        const linea = this.carrito.find(l => l.sku === sku);
        return linea ? linea.cantidad : 0;
    }

    // Precio y nombre: los de la venta original si ya estaba, si no los del inventario
    precioDe(sku) {
        const previo = this.original && this.original.items.find(i => i.sku === sku);
        return previo ? previo.precio : this.variante(sku).precio;
    }

    /* ---------- Búsqueda / escaneo ---------- */

    coincidencias() {
        const q = this.$("buscarVariante").value.trim().toLowerCase();
        return this.productos.variantesPlanas().filter(v =>
            `${v.producto} ${v.color} ${v.talla} ${v.sku} ${v.codigoBarras}`.toLowerCase().includes(q));
    }

    alTeclear(e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const q = this.$("buscarVariante").value.trim().toLowerCase();
        if (!q) return;
        // El lector de códigos "teclea" el código y pulsa Enter
        const exacta = this.productos.variantesPlanas().find(v =>
            v.sku.toLowerCase() === q || v.codigoBarras === q);
        const lista = this.coincidencias();
        const elegida = exacta || (lista.length === 1 ? lista[0] : null);
        if (!elegida) return this.aviso("Código no encontrado o hay varias coincidencias: elige una de la lista.", "error");
        if (this.agregar(elegida.sku)) { this.$("buscarVariante").value = ""; this.pintarResultados(); }
    }

    pintarResultados() {
        const cont = this.$("resultados");
        cont.replaceChildren();
        const lista = this.coincidencias().slice(0, 12);
        if (lista.length === 0) {
            const v = document.createElement("div");
            v.className = "vacio"; v.textContent = "No se encontraron artículos.";
            cont.appendChild(v);
            return;
        }
        lista.forEach(v => {
            const libre = this.disponible(v.sku) - this.enCarrito(v.sku);
            const b = document.createElement("button");
            b.type = "button"; b.className = "resultado-item"; b.dataset.sku = v.sku;
            b.disabled = libre <= 0;

            const info = document.createElement("div");
            info.className = "info";
            const nombre = document.createElement("b");
            nombre.textContent = v.producto;
            const det = document.createElement("small");
            det.textContent = `${v.color} · Talla ${v.talla} · ${v.sku} · ${v.ubicacion}`;
            info.append(nombre, det);

            const precio = document.createElement("span");
            precio.className = "precio";
            precio.textContent = VistaComun.dinero(v.precio);

            b.append(VistaComun.punto(this.productos.colorDe(v.color)), info, precio, VistaComun.insigniaStock(libre));
            cont.appendChild(b);
        });
    }

    /* ---------- Carrito ---------- */

    agregar(sku) {
        if (this.enCarrito(sku) + 1 > this.disponible(sku)) {
            this.aviso("No hay más existencias de ese artículo.", "error");
            return false;
        }
        const linea = this.carrito.find(l => l.sku === sku);
        if (linea) linea.cantidad++; else this.carrito.push({ sku, cantidad: 1 });
        this.limpiarAviso();
        this.pintarCarrito();
        this.pintarResultados();
        return true;
    }

    alHacerClicCarrito(e) {
        const b = e.target.closest("button[data-accion]");
        if (!b) return;
        const sku = b.dataset.sku;
        const linea = this.carrito.find(l => l.sku === sku);
        if (!linea) return;

        if (b.dataset.accion === "quitar") this.carrito = this.carrito.filter(l => l.sku !== sku);
        else if (b.dataset.accion === "mas") {
            if (linea.cantidad + 1 > this.disponible(sku)) return this.aviso("No hay más existencias de ese artículo.", "error");
            linea.cantidad++;
        } else if (b.dataset.accion === "menos") {
            linea.cantidad--;
            if (linea.cantidad <= 0) this.carrito = this.carrito.filter(l => l.sku !== sku);
        }
        this.limpiarAviso();
        this.pintarCarrito();
        this.pintarResultados();
    }

    pintarCarrito() {
        const cont = this.$("carrito");
        cont.replaceChildren();

        if (this.carrito.length === 0) {
            const v = document.createElement("div");
            v.className = "vacio"; v.textContent = "Escanea o busca un artículo para empezar.";
            cont.appendChild(v);
        }

        this.carrito.forEach(l => {
            const v = this.variante(l.sku);
            const precio = this.precioDe(l.sku);
            const fila = document.createElement("div");
            fila.className = "variante-item";

            const muestra = document.createElement("span");
            muestra.className = "muestra";
            muestra.style.background = this.productos.colorDe(v.color);

            const info = document.createElement("div");
            info.className = "info";
            const nombre = document.createElement("b");
            nombre.textContent = v.producto;
            const det = document.createElement("small");
            det.textContent = `${v.color} · Talla ${v.talla} · ${VistaComun.dinero(precio)} c/u`;
            info.append(nombre, det);

            const control = document.createElement("div");
            control.className = "cantidad-control";
            const mk = (accion, texto) => {
                const b = document.createElement("button");
                b.type = "button"; b.textContent = texto;
                b.dataset.accion = accion; b.dataset.sku = l.sku;
                b.setAttribute("aria-label", accion === "mas" ? "Sumar uno" : "Restar uno");
                return b;
            };
            const cant = document.createElement("span");
            cant.textContent = l.cantidad;
            control.append(mk("menos", "−"), cant, mk("mas", "+"));

            const sub = document.createElement("span");
            sub.className = "pares";
            sub.textContent = VistaComun.dinero(precio * l.cantidad);

            const quitar = document.createElement("button");
            quitar.type = "button"; quitar.className = "quitar"; quitar.textContent = "✕";
            quitar.dataset.accion = "quitar"; quitar.dataset.sku = l.sku;
            quitar.setAttribute("aria-label", "Quitar artículo");

            fila.append(muestra, info, control, sub, quitar);
            cont.appendChild(fila);
        });

        const pares = this.carrito.reduce((t, l) => t + l.cantidad, 0);
        const total = this.carrito.reduce((t, l) => t + this.precioDe(l.sku) * l.cantidad, 0);
        this.$("numArticulos").textContent = pares;
        this.$("totalVenta").textContent = VistaComun.dinero(total);
        this.$("btnCobrar").disabled = this.carrito.length === 0;
    }

    /* ---------- Cobrar / guardar ---------- */

    cobrar() {
        const metodo = this.$("metodoPago").value;
        const resultado = this.original
            ? this.ventas.actualizarVenta(this.id, this.carrito, metodo)
            : this.ventas.registrarVenta(this.carrito, metodo, this.sesion);

        if (!resultado.correcto) return this.aviso(resultado.mensaje, "error");
        const clave = this.original ? "actualizada" : "creada";
        location.href = `ventas.html?${clave}=${encodeURIComponent(resultado.venta.folio)}`;
    }
}
new ControladorNuevaVenta(new ModeloVentas(), new ModeloProductos(), Sesion.actual(), new URLSearchParams(location.search));
