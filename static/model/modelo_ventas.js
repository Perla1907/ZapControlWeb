class ModeloVentas {
    constructor(productos = new ModeloProductos()) {
        this.CLAVE = "zapcontrol.ventas";
        this.productos = productos;
        this.metodosPago = ["Efectivo", "Tarjeta", "Transferencia"];
        this.ventas = this.leer();
    }

    leer() {
        try {
            const dato = JSON.parse(localStorage.getItem(this.CLAVE));
            if (Array.isArray(dato)) return dato;
        } catch (e) { }
        return [];
    }

    guardar() {
        try { localStorage.setItem(this.CLAVE, JSON.stringify(this.ventas)); return true; }
        catch (e) { return false; }
    }

    /* ---------- Consultas ---------- */

    // El administrador ve todas; el empleado solo las suyas. Más recientes primero.
    obtenerVentas(sesion) {
        return this.ventas
            .filter(v => this.puedeVer(v, sesion))
            .sort((a, b) => b.id - a.id);
    }

    obtenerPorId(id) { return this.ventas.find(v => v.id === id); }

    puedeVer(venta, sesion) {
        return !!sesion && (sesion.rol === "Administrador" || venta.vendedor === sesion.usuario);
    }

    puedeEliminar(sesion) { return !!sesion && sesion.rol === "Administrador"; }

    claveDia(iso) {
        const d = new Date(iso);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    ventasDeHoy(sesion) {
        const hoy = this.claveDia(new Date().toISOString());
        return this.obtenerVentas(sesion).filter(v => this.claveDia(v.fecha) === hoy);
    }

    siguienteId() { return this.ventas.reduce((m, v) => Math.max(m, v.id), 0) + 1; }

    folio(id) { return `VNT-${String(id).padStart(5, "0")}`; }

    total(lineas) { return lineas.reduce((t, l) => t + l.precio * l.cantidad, 0); }

    /* ---------- Piezas internas ---------- */

    // items: [{ sku, cantidad }]. Conserva nombre y precio de las líneas previas (venta editada).
    construirItems(items, previos = []) {
        const lineas = [];
        for (const it of items) {
            const cantidad = Number(it.cantidad);
            if (!Number.isInteger(cantidad) || cantidad < 1) {
                return { error: "Las cantidades deben ser números enteros mayores a cero." };
            }
            const hallado = this.productos.buscarVariante(it.sku);
            if (!hallado) return { error: `El artículo ${it.sku} ya no existe en el inventario.` };
            const { producto, variante } = hallado;
            const previo = previos.find(p => p.sku === it.sku);
            lineas.push({
                sku: variante.sku,
                codigoBarras: variante.codigoBarras,
                producto: previo ? previo.producto : `${producto.marca} ${producto.modelo}`,
                color: variante.color,
                talla: variante.talla,
                precio: previo ? previo.precio : producto.precio,
                cantidad
            });
        }
        return { lineas };
    }

    // Devuelve un mensaje si alguna línea pide más de lo que hay; null si todo alcanza
    sinExistencias(lineas) {
        for (const l of lineas) {
            const hallado = this.productos.buscarVariante(l.sku);
            const hay = hallado ? hallado.variante.existencias : 0;
            if (l.cantidad > hay) {
                return `No hay existencias suficientes de ${l.producto} (${l.color}, talla ${l.talla}). Disponibles: ${hay}.`;
            }
        }
        return null;
    }

    // signo -1 descuenta del inventario, +1 lo regresa
    aplicarStock(lineas, signo) {
        lineas.forEach(l => this.productos.ajustarExistencias(l.sku, signo * l.cantidad));
    }

    validarGeneral(items, metodoPago) {
        if (!items || items.length === 0) return "Agrega al menos un artículo a la venta.";
        if (!this.metodosPago.includes(metodoPago)) return "Elige un método de pago válido.";
        return null;
    }

    /* ---------- Alta, edición y baja ---------- */

    registrarVenta(items, metodoPago, sesion) {
        const falla = this.validarGeneral(items, metodoPago);
        if (falla) return { correcto: false, mensaje: falla };

        const { lineas, error } = this.construirItems(items);
        if (error) return { correcto: false, mensaje: error };

        const sinStock = this.sinExistencias(lineas);
        if (sinStock) return { correcto: false, mensaje: sinStock };

        const id = this.siguienteId();
        const venta = {
            id,
            folio: this.folio(id),
            fecha: new Date().toISOString(),
            vendedor: sesion.usuario,
            nombreVendedor: sesion.nombre,
            metodoPago,
            items: lineas,
            total: this.total(lineas)
        };

        this.aplicarStock(lineas, -1);
        this.ventas.push(venta);
        if (!this.guardar()) {
            this.ventas.pop();
            this.aplicarStock(lineas, +1);
            return { correcto: false, mensaje: "No fue posible guardar la venta." };
        }
        return { correcto: true, venta };
    }

    actualizarVenta(id, items, metodoPago) {
        const venta = this.obtenerPorId(id);
        if (!venta) return { correcto: false, mensaje: "La venta no existe." };

        const falla = this.validarGeneral(items, metodoPago);
        if (falla) return { correcto: false, mensaje: falla };

        const { lineas, error } = this.construirItems(items, venta.items);
        if (error) return { correcto: false, mensaje: error };

        // Primero se regresa lo que llevaba la venta; luego se valida contra el inventario
        this.aplicarStock(venta.items, +1);
        const sinStock = this.sinExistencias(lineas);
        if (sinStock) {
            this.aplicarStock(venta.items, -1);
            return { correcto: false, mensaje: sinStock };
        }

        const anterior = { ...venta };
        this.aplicarStock(lineas, -1);
        venta.items = lineas;
        venta.metodoPago = metodoPago;
        venta.total = this.total(lineas);
        venta.editadaEn = new Date().toISOString();

        if (!this.guardar()) {
            Object.assign(venta, anterior);
            this.aplicarStock(lineas, +1);
            this.aplicarStock(anterior.items, -1);
            return { correcto: false, mensaje: "No fue posible guardar los cambios." };
        }
        return { correcto: true, venta };
    }

    eliminarVenta(id) {
        const venta = this.obtenerPorId(id);
        if (!venta) return false;
        this.ventas = this.ventas.filter(v => v.id !== id);
        if (!this.guardar()) { this.ventas.push(venta); return false; }
        this.aplicarStock(venta.items, +1);
        return true;
    }
}
