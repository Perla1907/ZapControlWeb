class ControladorCategorias {
    constructor(modelo, vista, params) {
        this.modelo = modelo;
        this.vista = vista;

        this.vista.tabla.addEventListener("click", evento => this.abrirEdicion(evento));

        this.actualizarVista();

        const parametros = params;
        if (parametros.get("creada") === "1") {
            this.vista.mostrarMensaje("Categoría registrada correctamente", "exito");
        } else if (parametros.get("actualizada") === "1") {
            this.vista.mostrarMensaje("Categoría actualizada correctamente", "exito");
        } else if (parametros.get("eliminada") === "1") {
            this.vista.mostrarMensaje("Categoría eliminada correctamente", "exito");
        }
    }

    abrirEdicion(evento) {
        const boton = evento.target.closest("button[data-id]");
        if (!boton || !this.vista.tabla.contains(boton)) return;
        location.href = `editar-categoria.html?id=${encodeURIComponent(boton.dataset.id)}`;
    }

    actualizarVista() {
        this.vista.renderizarCategorias(this.modelo.obtenerCategorias());
    }
}

new ControladorCategorias(new ModeloCategorias(), new VistaCategorias(), new URLSearchParams(location.search));
