// Arma el ticket de una venta (se usa en el historial y al imprimir)
class VistaTicket {
    static crear(venta) {
        const ticket = document.createElement("div");
        ticket.className = "ticket";

        const centro = (texto, clase = "") => {
            const d = document.createElement("div");
            d.className = ("t-centro " + clase).trim();
            d.textContent = texto;
            return d;
        };
        const linea = (izq, der, clase = "") => {
            const d = document.createElement("div");
            d.className = ("t-linea " + clase).trim();
            const a = document.createElement("span"), b = document.createElement("span");
            a.textContent = izq; b.textContent = der;
            d.append(a, b);
            return d;
        };
        const detalle = texto => {
            const d = document.createElement("div");
            d.className = "t-detalle";
            d.textContent = texto;
            return d;
        };
        const raya = () => document.createElement("hr");

        ticket.append(
            centro("ZapControl", "t-titulo"),
            centro("Ticket de venta"),
            raya(),
            linea("Folio", venta.folio),
            linea("Fecha", VistaComun.fechaHora(venta.fecha)),
            linea("Atendió", venta.nombreVendedor || venta.vendedor),
            linea("Pago", venta.metodoPago),
            raya()
        );

        venta.items.forEach(i => {
            ticket.append(
                linea(`${i.cantidad}x ${i.producto}`, VistaComun.dinero(i.cantidad * i.precio)),
                detalle(`${i.color} · Talla ${i.talla} · ${VistaComun.dinero(i.precio)} c/u`)
            );
        });

        ticket.append(raya(), linea("TOTAL", VistaComun.dinero(venta.total), "t-total"), raya());
        if (venta.editadaEn) ticket.append(centro(`Editada el ${VistaComun.fechaHora(venta.editadaEn)}`, "t-detalle"));
        ticket.append(centro("¡Gracias por su compra!"));
        return ticket;
    }
}
