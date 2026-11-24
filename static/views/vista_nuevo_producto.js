class VistaNuevoProducto {
    constructor() {
        const $ = id => document.getElementById(id);
        this.formulario = $("formNuevoProducto");
        this.marca = $("marca"); this.modelo = $("modelo"); this.categoria = $("categoria");
        this.precio = $("precio"); this.ubicacion = $("ubicacion");
        this.color = $("color"); this.talla = $("talla"); this.existencias = $("existencias");
        this.btnNuevoColor = $("btnNuevoColor"); this.panelColor = $("panelColor");
        this.colorNombre = $("colorNombre"); this.colorMuestra = $("colorMuestra");
        this.btnCancelarColor = $("btnCancelarColor"); this.btnGuardarColor = $("btnGuardarColor");
        this.btnAgregarVariante = $("btnAgregarVariante"); this.avisoVariante = $("avisoVariante");
        this.lista = $("variantes"); this.totalVariantes = $("totalVariantes"); this.totalPares = $("totalPares");
        this.errorForm = $("errorForm"); this.mensaje = $("mensaje"); this.btnMenu = $("btnMenu");
        this.etiquetaCaja = $("etiquetaCaja"); this.btnImprimir = $("btnImprimir");
        this.hoja = $("hojaEtiquetas"); this.toast = $("toast");
        this.temporizadorToast = null;
    }

    llenarSelect(select, opciones, textoInicial) {
        select.innerHTML = "";
        const ini = document.createElement("option");
        ini.value = ""; ini.textContent = textoInicial;
        select.appendChild(ini);
        opciones.forEach(o => {
            const op = document.createElement("option");
            op.value = o; op.textContent = o;
            select.appendChild(op);
        });
    }

    cargarCatalogos(modelo) {
        this.llenarSelect(this.marca, modelo.marcas, "Seleccionar marca");
        this.llenarSelect(this.categoria, modelo.obtenerCategorias(), "Seleccionar categoría");
        this.llenarSelect(this.ubicacion, modelo.ubicaciones, "Seleccionar ubicación");
        this.llenarSelect(this.talla, modelo.tallas, "Talla");
        this.cargarColores(modelo);
    }

    cargarColores(modelo, seleccionar = "") {
        this.llenarSelect(this.color, modelo.obtenerColores().map(c => c.nombre), "Seleccionar color");
        this.color.value = seleccionar;
    }


    leerPrecio() {
        return this.precio.value.replace(/[^0-9.]/g, "");
    }

    formatearPrecio() {
        const n = Number(this.leerPrecio());
        if (this.leerPrecio() !== "" && Number.isFinite(n)) {
            this.precio.value = "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    quitarFormatoPrecio() {
        this.precio.value = this.leerPrecio();
    }

    datos() {
        return {
            marca: this.marca.value, modelo: this.modelo.value.trim(),
            categoria: this.categoria.value, precio: this.leerPrecio(),
            ubicacion: this.ubicacion.value
        };
    }


    panelColorAbierto() { return !this.panelColor.hidden; }

    alternarPanelColor(abrir) {
        this.panelColor.hidden = !abrir;
        if (abrir) this.colorNombre.focus(); else this.colorNombre.value = "";
    }


    avisarVariante(texto, tipo = "ok") {
        this.avisoVariante.textContent = texto;
        this.avisoVariante.className = "aviso-variante" + (tipo === "error" ? " error" : "");
    }

    dibujarVariantes(variantes, modelo, alQuitar) {
        this.lista.innerHTML = "";
        if (variantes.length === 0) {
            const p = document.createElement("p");
            p.className = "vacio"; p.textContent = "Aún no hay variantes.";
            this.lista.appendChild(p);
        }
        variantes.forEach((v, i) => {
            const fila = document.createElement("div");
            fila.className = "variante-item";
            fila.innerHTML = `<span class="muestra"></span>
                <div class="info"><b></b><small></small></div>
                <button type="button" class="quitar" aria-label="Quitar variante">🗑</button>`;
            fila.querySelector(".muestra").style.background = modelo.colorDe(v.color);
            fila.querySelector("b").textContent = `${v.color} · Talla ${v.talla}`;
            fila.querySelector("small").textContent = `${v.existencias} pares`;
            fila.querySelector(".quitar").addEventListener("click", () => alQuitar(i));
            this.lista.appendChild(fila);
        });
        const pares = variantes.reduce((t, v) => t + v.existencias, 0);
        this.totalVariantes.textContent = `${variantes.length} ${variantes.length === 1 ? "variante" : "variantes"}`;
        this.totalPares.textContent = `${pares} pares`;
    }

    mostrarError(t) { this.errorForm.textContent = t; this.errorForm.hidden = false; }
    limpiarError() { this.errorForm.textContent = ""; this.errorForm.hidden = true; }

    mostrarToast(texto) {
        this.toast.textContent = texto;
        this.toast.hidden = false;
        clearTimeout(this.temporizadorToast);
        this.temporizadorToast = setTimeout(() => { this.toast.hidden = true; }, 3500);
    }


    svgEAN13(codigo, alto = 60) {
        const L = ["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"];
        const G = ["0100111","0110011","0011011","0100001","0011101","0111001","0000101","0010001","0001001","0010111"];
        const R = ["1110010","1100110","1101100","1000010","1011100","1001110","1010000","1000100","1001000","1110100"];
        const P = ["LLLLLL","LLGLGG","LLGGLG","LLGGGL","LGLLGG","LGGLLG","LGGGLL","LGLGLG","LGLGGL","LGGLGL"];
        const d = codigo.split("").map(Number);
        let bits = "101";
        for (let i = 1; i <= 6; i++) bits += (P[d[0]][i - 1] === "L" ? L : G)[d[i]];
        bits += "01010";
        for (let i = 7; i <= 12; i++) bits += R[d[i]];
        bits += "101";

        let rects = "";
        for (let i = 0; i < bits.length; i++) {
            if (bits[i] === "1") rects += `<rect x="${i + 5}" y="0" width="1" height="${alto}"/>`;
        }
        return { ancho: bits.length + 10, alto, contenido: rects };
    }

    pintarBarras(svg, codigo) {
        const e = this.svgEAN13(codigo);
        svg.setAttribute("viewBox", `0 0 ${e.ancho} ${e.alto}`);
        svg.setAttribute("preserveAspectRatio", "none");
        svg.innerHTML = `<g fill="#0f2742">${e.contenido}</g>`;
    }


    pintarQR(svg, semilla) {
        const n = 21;
        let s = 0;
        for (const ch of semilla) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
        const azar = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
        const buscador = (x, y) => {
            const fx = x < 7 ? x : x - (n - 7), fy = y < 7 ? y : y - (n - 7);
            if (!((x < 7 || x >= n - 7) && (y < 7 || y >= n - 7)) || (x >= n - 7 && y >= n - 7)) return null;
            return fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
        };
        let r = "";
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
            const f = buscador(x, y);
            const on = f === null ? azar() > 0.5 : f;
            if (on) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
        }
        svg.setAttribute("viewBox", `0 0 ${n} ${n}`);
        svg.innerHTML = `<g fill="#0f2742">${r}</g>`;
    }

    mostrarEtiqueta(producto) {
        const tallas = [...new Set(producto.variantes.map(v => Number(v.talla)))].sort((a, b) => a - b);
        const colores = [...new Set(producto.variantes.map(v => v.color))];
        const detalle = `${tallas.length > 1 ? "Tallas" : "Talla"} ${tallas.join(", ")} · ${colores.join(" / ")}`;

        document.getElementById("etqNombre").textContent = `${producto.marca} ${producto.modelo}`;
        document.getElementById("etqDetalle").textContent = detalle;
        const v0 = producto.variantes[0];
        document.getElementById("etqCodigo").textContent = v0.codigoBarras;
        document.getElementById("etqSku").textContent = `SKU ${v0.sku}`;
        this.pintarBarras(document.getElementById("etqBarras"), v0.codigoBarras);
        this.pintarQR(document.getElementById("etqQR"), v0.sku);

        const n = producto.variantes.length;
        this.btnImprimir.textContent = `Imprimir ${n} ${n === 1 ? "etiqueta" : "etiquetas"} (una por variante)`;

        this.hoja.innerHTML = "";
        producto.variantes.forEach(v => {
            const e = document.createElement("div");
            e.className = "etq-impresa";
            e.innerHTML = `<strong></strong><span class="d"></span>
                <svg class="b" xmlns="http://www.w3.org/2000/svg"></svg>
                <span class="c"></span><span class="s"></span>`;
            e.querySelector("strong").textContent = `${producto.marca} ${producto.modelo}`;
            e.querySelector(".d").textContent = `Talla ${v.talla} · ${v.color}`;
            e.querySelector(".c").textContent = v.codigoBarras;
            e.querySelector(".s").textContent = `SKU ${v.sku}`;
            this.pintarBarras(e.querySelector(".b"), v.codigoBarras);
            this.hoja.appendChild(e);
        });

        this.formulario.hidden = true;
        this.etiquetaCaja.hidden = false;
    }
}