class VistaCategorias {
    constructor() {
        this.tabla = document.getElementById("tablaCategorias");
        this.mensaje = document.getElementById("mensaje");
    }

    renderizarCategorias(categorias) {
        this.tabla.replaceChildren();

        if (categorias.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.colSpan = 4;
            celda.className = "vacio";
            celda.textContent = "No hay categorías registradas.";
            fila.appendChild(celda);
            this.tabla.appendChild(fila);
            return;
        }

        categorias.forEach(categoria => {
            const fila = document.createElement("tr");
            const tdNombre = document.createElement("td");
            const punto = document.createElement("span");
            punto.className = "punto";
            punto.style.background = categoria.color;
            tdNombre.append(punto, document.createTextNode(categoria.nombre));

            const tdDescripcion = document.createElement("td");
            tdDescripcion.textContent = categoria.descripcion;

            const tdProductos = document.createElement("td");
            tdProductos.textContent = categoria.productos;

            const tdAcciones = document.createElement("td");
            tdAcciones.className = "acciones";
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "btn";
            boton.textContent = "Editar";
            boton.dataset.id = categoria.id;
            tdAcciones.appendChild(boton);

            fila.append(tdNombre, tdDescripcion, tdProductos, tdAcciones);
            this.tabla.appendChild(fila);
        });
    }

    mostrarMensaje(texto, tipo) {
        this.mensaje.textContent = texto;
        this.mensaje.className = `aviso ${tipo}`;
    }
}
