class ControladorDashboard {
    constructor(productos, categorias, ventas, sesion) {
        const $ = id => document.getElementById(id);
        $("statProductos").textContent = productos.obtenerProductos().length;
        $("statPares").textContent = productos.totalPares();
        $("statCategorias").textContent = categorias.obtenerCategorias().length;
        // Admin: todas las ventas de hoy; empleado: solo las suyas
        $("statVentasTitulo").textContent = sesion.rol === "Administrador" ? "Ventas de hoy" : "Mis ventas de hoy";
        const hoy = ventas.ventasDeHoy(sesion);
        $("statVentas").textContent = hoy.length;
        $("statVentasTotal").textContent = VistaComun.dinero(hoy.reduce((t, v) => t + v.total, 0)) + " vendidos";

        const bajas = productos.variantesPlanas().filter(v => v.existencias <= 3)
            .sort((a, b) => a.existencias - b.existencias);
        VistaComun.llenarTabla($("tablaBajas"),
            bajas.map(v => [v.producto, v.color, v.talla, VistaComun.insigniaStock(v.existencias)]),
            4, "Todo el inventario está en buen nivel.");
    }
}
new ControladorDashboard(new ModeloProductos(), new ModeloCategorias(), new ModeloVentas(), Sesion.actual());
