// Igual que la vista de nuevo producto, pero la lista de variantes permite editar existencias
class VistaEditarProducto extends VistaNuevoProducto {
    constructor() {
        super();
        this.alCambiarStock = null;
    }

    // Llena el formulario con los datos del producto
    cargarProducto(producto) {
        this.asegurarOpcion(this.marca, producto.marca);
        this.asegurarOpcion(this.categoria, producto.categoria);
        this.asegurarOpcion(this.ubicacion, producto.ubicacion);
        this.marca.value = producto.marca;
        this.modelo.value = producto.modelo;
        this.categoria.value = producto.categoria;
        this.ubicacion.value = producto.ubicacion;
        this.precio.value = producto.precio;
        this.formatearPrecio();
    }

    asegurarOpcion(select, valor) {
        if (![...select.options].some(o => o.value === valor)) {
            const op = document.createElement("option");
            op.value = valor; op.textContent = valor;
            select.appendChild(op);
        }
    }

    dibujarVariantes(variantes, modelo, alQuitar) {
        this.lista.replaceChildren();
        if (variantes.length === 0) {
            const p = document.createElement("p");
            p.className = "vacio"; p.textContent = "El producto no tiene variantes.";
            this.lista.appendChild(p);
        }

        variantes.forEach((v, i) => {
            const fila = document.createElement("div");
            fila.className = "variante-item";

            const muestra = document.createElement("span");
            muestra.className = "muestra";
            muestra.style.background = modelo.colorDe(v.color);

            const info = document.createElement("div");
            info.className = "info";
            const titulo = document.createElement("b");
            titulo.textContent = `${v.color} · Talla ${v.talla}`;
            const detalle = document.createElement("small");
            detalle.textContent = v.sku ? `SKU ${v.sku}` : "Variante nueva (se generará su SKU al guardar)";
            info.append(titulo, detalle);

            const stock = document.createElement("input");
            stock.type = "number"; stock.min = "0"; stock.step = "1";
            stock.className = "stock-input";
            stock.value = v.existencias;
            stock.setAttribute("aria-label", `Existencias de ${v.color} talla ${v.talla}`);
            stock.addEventListener("input", () => {
                if (this.alCambiarStock) this.alCambiarStock(i, stock.value);
            });

            const quitar = document.createElement("button");
            quitar.type = "button"; quitar.className = "quitar"; quitar.textContent = "🗑";
            quitar.setAttribute("aria-label", "Quitar variante");
            quitar.addEventListener("click", () => alQuitar(i));

            fila.append(muestra, info, stock, quitar);
            this.lista.appendChild(fila);
        });

        this.actualizarTotales(variantes);
    }

    actualizarTotales(variantes) {
        const pares = variantes.reduce((t, v) => t + (Number(v.existencias) || 0), 0);
        this.totalVariantes.textContent = `${variantes.length} ${variantes.length === 1 ? "variante" : "variantes"}`;
        this.totalPares.textContent = `${pares} pares`;
    }
}
