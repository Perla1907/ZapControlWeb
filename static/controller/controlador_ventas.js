// Historial de ventas: buscar, filtrar por día, ver ticket, editar y (admin) eliminar
class ControladorVentas {
    constructor(modelo, sesion, params) {
        this.modelo = modelo;
        this.sesion = sesion;
        this.$ = id => document.getElementById(id);
        this.idPorEliminar = null;

        this.$("buscarVenta").addEventListener("input", () => this.pintar());
        this.$("filtroFecha").addEventListener("input", () => this.pintar());
        this.$("btnLimpiar").addEventListener("click", () => {
            this.$("buscarVenta").value = "";
            this.$("filtroFecha").value = "";
            this.pintar();
        });
        this.$("tablaVentas").addEventListener("click", e => this.alHacerClic(e));

        this.$("btnCerrarTicket").addEventListener("click", () => this.$("dlgTicket").close());
        this.$("btnImprimirTicket").addEventListener("click", () => this.imprimir());
        this.$("btnCancelarEliminar").addEventListener("click", () => this.$("dlgEliminar").close());
        this.$("btnConfirmarEliminar").addEventListener("click", () => this.confirmarEliminar());

        if (params.has("creada")) this.aviso(`Venta ${params.get("creada")} registrada correctamente.`, "exito");
        else if (params.has("actualizada")) this.aviso(`Venta ${params.get("actualizada")} actualizada correctamente.`, "exito");

        this.pintar();
    }

    aviso(texto, tipo) { VistaComun.mensaje(this.$("mensaje"), texto, tipo); }

    textoItems(v) { return v.items.map(i => `${i.cantidad}x ${i.producto} ${i.color} T${i.talla}`).join(" "); }

    filtradas() {
        const q = this.$("buscarVenta").value.trim().toLowerCase();
        const dia = this.$("filtroFecha").value;
        return this.modelo.obtenerVentas(this.sesion).filter(v => {
            const texto = `${v.folio} ${v.vendedor} ${v.nombreVendedor || ""} ${v.metodoPago} ${this.textoItems(v)}`.toLowerCase();
            return texto.includes(q) && (!dia || this.modelo.claveDia(v.fecha) === dia);
        });
    }

    pintar() {
        const lista = this.filtradas();
        const esAdmin = this.modelo.puedeEliminar(this.sesion);

        VistaComun.llenarTabla(this.$("tablaVentas"), lista.map(v => [
            this.celdaFolio(v),
            VistaComun.fechaHora(v.fecha),
            v.nombreVendedor || v.vendedor,
            this.celdaProductos(v),
            v.metodoPago,
            VistaComun.dinero(v.total),
            this.celdaAcciones(v, esAdmin)
        ]), 7, "No hay ventas que coincidan.");

        const total = lista.reduce((t, v) => t + v.total, 0);
        this.$("resumenVentas").textContent = `${lista.length} venta(s) · Total ${VistaComun.dinero(total)}`;
    }

    celdaFolio(v) {
        const c = document.createElement("span");
        const fuerte = document.createElement("strong");
        fuerte.textContent = v.folio;
        c.appendChild(fuerte);
        if (v.editadaEn) {
            const ins = document.createElement("span");
            ins.className = "insignia bajo ms-2";
            ins.textContent = "Editada";
            c.appendChild(ins);
        }
        return c;
    }

    celdaProductos(v) {
        const c = document.createElement("div");
        v.items.forEach(i => {
            const d = document.createElement("div");
            d.textContent = `${i.cantidad}x ${i.producto} · ${i.color} · T${i.talla}`;
            c.appendChild(d);
        });
        return c;
    }

    celdaAcciones(v, esAdmin) {
        const c = document.createElement("div");
        c.className = "d-flex gap-1 justify-content-end flex-nowrap";
        const boton = (accion, texto, clase = "btn") => {
            const b = document.createElement("button");
            b.type = "button"; b.className = clase; b.textContent = texto;
            b.dataset.accion = accion; b.dataset.id = v.id;
            return b;
        };
        c.append(boton("ticket", "Ticket"), boton("editar", "Editar"));
        if (esAdmin) c.append(boton("eliminar", "Eliminar", "btn btn-peligro"));
        return c;
    }

    alHacerClic(e) {
        const b = e.target.closest("button[data-accion]");
        if (!b) return;
        const venta = this.modelo.obtenerPorId(Number(b.dataset.id));
        if (!venta || !this.modelo.puedeVer(venta, this.sesion)) return;

        if (b.dataset.accion === "ticket") this.verTicket(venta);
        else if (b.dataset.accion === "editar") location.href = `nueva_venta.html?id=${venta.id}`;
        else if (b.dataset.accion === "eliminar") this.pedirEliminar(venta);
    }

    verTicket(venta) {
        this.ventaEnTicket = venta;
        this.$("ticketContenido").replaceChildren(VistaTicket.crear(venta));
        this.$("dlgTicket").showModal();
    }

    imprimir() {
        // Reutiliza la hoja de impresión: estilos.css oculta todo lo demás al imprimir
        this.$("hojaEtiquetas").replaceChildren(VistaTicket.crear(this.ventaEnTicket));
        window.print();
    }

    pedirEliminar(venta) {
        this.idPorEliminar = venta.id;
        this.$("textoEliminar").textContent =
            `¿Eliminar la venta ${venta.folio} por ${VistaComun.dinero(venta.total)}? Los pares regresarán al inventario. Esta acción no se puede deshacer.`;
        this.$("dlgEliminar").showModal();
    }

    confirmarEliminar() {
        const venta = this.modelo.obtenerPorId(this.idPorEliminar);
        this.$("dlgEliminar").close();
        if (!venta) return;
        if (this.modelo.eliminarVenta(venta.id)) this.aviso(`Venta ${venta.folio} eliminada. Las existencias se regresaron al inventario.`, "exito");
        else this.aviso("No fue posible eliminar la venta.", "error");
        this.pintar();
    }
}
new ControladorVentas(new ModeloVentas(), Sesion.actual(), new URLSearchParams(location.search));
