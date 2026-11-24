class ControladorEditarCategoria {
    constructor(modelo, params) {
        this.modelo = modelo;
        this.id = Number(params.get("id"));
        this.categoria = this.modelo.obtenerPorId(this.id);

        this.formulario = document.getElementById("formNueva");
        this.inputNombre = document.getElementById("nombre");
        this.inputDescripcion = document.getElementById("descripcion");
        this.contenedorColores = document.getElementById("colores");
        this.errorForm = document.getElementById("errorForm");
        this.btnEliminar = document.getElementById("btnEliminar");

        if (!this.categoria) {
            location.href = "categorias.html";
            return;
        }

        this.crearSelectorColores(this.modelo.colores, this.categoria.color);
        this.inputNombre.value = this.categoria.nombre;
        this.inputDescripcion.value = this.categoria.descripcion;
        this.formulario.addEventListener("submit", evento => this.guardarCambios(evento));

        if (this.btnEliminar) {
            const bloqueada = this.categoria.productos > 0;
            this.btnEliminar.hidden = false;
            this.btnEliminar.disabled = bloqueada;
            this.btnEliminar.title = bloqueada ? "Una categoría con productos no se puede eliminar" : "";
            this.btnEliminar.addEventListener("click", () => this.eliminarCategoria());
        }
    }

    crearSelectorColores(colores, colorActual) {
        this.contenedorColores.replaceChildren();
        const paleta = [...colores];
        if (!paleta.includes(colorActual)) paleta.push(colorActual);

        paleta.forEach(color => {
            const label = document.createElement("label");
            const radio = document.createElement("input");
            const span = document.createElement("span");
            radio.type = "radio";
            radio.name = "color";
            radio.value = color;
            radio.checked = color === colorActual;
            span.style.backgroundColor = color;
            label.title = color;
            label.setAttribute("aria-label", `Color ${color}`);
            label.append(radio, span);
            this.contenedorColores.appendChild(label);
        });
    }

    obtenerDatosFormulario() {
        const radio = this.contenedorColores.querySelector("input:checked");
        return {
            nombre: this.inputNombre.value.trim(),
            descripcion: this.inputDescripcion.value.trim(),
            color: radio ? radio.value : this.categoria.color
        };
    }

    mostrarError(texto) {
        this.errorForm.textContent = texto;
        this.errorForm.hidden = false;
    }

    guardarCambios(evento) {
        evento.preventDefault();
        const datos = this.obtenerDatosFormulario();

        if (!datos.nombre) {
            this.mostrarError("El nombre de la categoría es obligatorio.");
            return;
        }
        if (this.modelo.existeNombre(datos.nombre, this.id)) {
            this.mostrarError("Ya existe una categoría con ese nombre.");
            return;
        }

        this.modelo.actualizarCategoria(this.id, datos.nombre, datos.descripcion, datos.color);
        location.href = "categorias.html?actualizada=1";
    }

    eliminarCategoria() {
        if (!this.modelo.eliminarCategoria(this.id)) {
            this.mostrarError("Una categoría con productos no se puede eliminar.");
            return;
        }
        location.href = "categorias.html?eliminada=1";
    }
}

new ControladorEditarCategoria(new ModeloCategorias(), new URLSearchParams(location.search));
