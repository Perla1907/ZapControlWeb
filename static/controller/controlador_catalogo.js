// Catálogo de consulta (rol público): solo lectura de productos, tallas, colores y existencias
class ControladorCatalogo {
    constructor(modelo) {
        this.modelo = modelo;
        this.buscador = document.getElementById("buscarCatalogo");
        this.contenedor = document.getElementById("tarjetasCatalogo");
        this.buscador.addEventListener("input", () => this.pintar());
        this.pintar();
    }

    tarjeta(p) {
        const col = document.createElement("div");
        col.className = "col-sm-6 col-lg-4";
        const t = document.createElement("div");
        t.className = "tarjeta p-3 h-100";

        const nombre = document.createElement("strong");
        nombre.textContent = `${p.marca} ${p.modelo}`;
        const cat = document.createElement("div");
        cat.className = "text-secondary small";
        cat.textContent = p.categoria;
        const precio = document.createElement("div");
        precio.className = "fs-5 fw-bold my-2";
        precio.textContent = VistaComun.dinero(p.precio);

        const variantes = document.createElement("div");
        variantes.className = "d-grid gap-1 mb-2";
        p.variantes.forEach(v => {
            const fila = document.createElement("div");
            fila.className = "d-flex align-items-center gap-2 small";
            const txt = document.createElement("span");
            txt.className = "flex-grow-1";
            txt.textContent = `${v.color} · Talla ${v.talla}`;
            fila.append(VistaComun.punto(this.modelo.colorDe(v.color)), txt, VistaComun.insigniaStock(v.existencias));
            variantes.appendChild(fila);
        });

        const pie = document.createElement("small");
        pie.className = "text-secondary";
        pie.textContent = `Ubicación: ${p.ubicacion}`;
        t.append(nombre, cat, precio, variantes, pie);
        col.appendChild(t);
        return col;
    }

    pintar() {
        const q = this.buscador.value.trim().toLowerCase();
        const lista = this.modelo.obtenerProductos().filter(p =>
            `${p.marca} ${p.modelo} ${p.categoria}`.toLowerCase().includes(q));
        this.contenedor.replaceChildren();
        if (lista.length === 0) {
            const p = document.createElement("p");
            p.className = "vacio col-12"; p.textContent = "No se encontraron productos.";
            this.contenedor.appendChild(p);
            return;
        }
        lista.forEach(p => this.contenedor.appendChild(this.tarjeta(p)));
    }
}
new ControladorCatalogo(new ModeloProductos());
