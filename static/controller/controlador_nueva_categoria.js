class VistaNuevaCategoria {
    constructor(colores) {
        this.formulario = document.getElementById("formNueva");
        this.inputNombre = document.getElementById("nombre");
        this.inputDescripcion = document.getElementById("descripcion");
        this.contenedorColores = document.getElementById("colores");
        this.errorForm = document.getElementById("errorForm");
        this.crearSelectorColores(colores);
    }

    crearSelectorColores(colores) {
        this.contenedorColores.replaceChildren();
        colores.forEach((color, i) => {
            const label = document.createElement("label");
            const radio = document.createElement("input");
            const span = document.createElement("span");
            radio.type = "radio";
            radio.name = "color";
            radio.value = color;
            radio.required = i === 0;
            if (i === 0) radio.checked = true;
            span.style.backgroundColor = color;
            label.title = color;
            label.setAttribute("aria-label", `Color ${color}`);
            label.append(radio, span);
            this.contenedorColores.appendChild(label);
        });
    }

    obtenerDatosFormulario() {
        const seleccionado = this.contenedorColores.querySelector("input:checked");
        return {
            nombre: this.inputNombre.value.trim(),
            descripcion: this.inputDescripcion.value.trim(),
            color: seleccionado ? seleccionado.value : "#1565c0"
        };
    }

    mostrarError(texto) {
        this.errorForm.textContent = texto;
        this.errorForm.hidden = false;
    }
}

class ControladorNuevaCategoria {
    constructor(modelo, vista) {
        this.modelo = modelo;
        this.vista = vista;
        this.vista.formulario.addEventListener("submit", evento => this.agregarCategoria(evento));
    }

    agregarCategoria(evento) {
        evento.preventDefault();
        const datos = this.vista.obtenerDatosFormulario();

        if (!datos.nombre) {
            this.vista.mostrarError("El nombre de la categoría es obligatorio.");
            return;
        }
        if (this.modelo.existeNombre(datos.nombre)) {
            this.vista.mostrarError("Ya existe una categoría con ese nombre.");
            return;
        }

        this.modelo.registrarCategoria(datos.nombre, datos.descripcion, datos.color);
        location.href = "categorias.html?creada=1";
    }
}

const modelo = new ModeloCategorias();
new ControladorNuevaCategoria(modelo, new VistaNuevaCategoria(modelo.colores));
