class ModeloProductos {
    constructor() {
        this.CLAVE = "zapcontrol.productos";

        this.marcas = ["Nike", "Adidas", "Puma", "Reebok", "New Balance"];
        this.tallas = ["22", "23", "24", "25", "26", "27", "28", "29", "30"];
        this.ubicaciones = ["Estante A1", "Estante A2", "Estante A3", "Estante B1", "Bodega"];

        this.coloresBase = [
            { nombre: "Blanco", color: "#ffffff" },
            { nombre: "Negro",  color: "#111111" },
            { nombre: "Gris",   color: "#8a94a6" },
            { nombre: "Azul",   color: "#2f5fe3" },
            { nombre: "Rojo",   color: "#e53935" },
            { nombre: "Café",   color: "#7b5333" },
            { nombre: "Verde",  color: "#2e9e5b" },
            { nombre: "Beige",  color: "#d9c3a0" }
        ];
        this.coloresExtra = [];
        this.productos = this.leer(this.CLAVE);
        if (localStorage.getItem(this.CLAVE) === null && this.productos.length === 0) this.sembrar();
    }

    sembrar() {
        const demo = [
            ["Nike", "Air Max Excee", "Tenis", 1899, "Estante A1", [["Blanco", "26", 5], ["Negro", "27", 4]]],
            ["Adidas", "Run Falcon", "Tenis", 1200, "Estante A2", [["Azul", "25", 8]]],
            ["Reebok", "Trail Boot", "Botas", 1450, "Estante B1", [["Café", "27", 3], ["Negro", "28", 2]]],
            ["Puma", "Classic Oxford", "Formal", 1100, "Estante A3", [["Negro", "26", 6]]],
            ["New Balance", "574 Urban", "Casual", 1599, "Estante A2", [["Gris", "25", 7], ["Beige", "26", 1]]],
            ["Nike", "Benassi", "Sandalias", 650, "Bodega", [["Negro", "27", 12]]]
        ];
        let n = 1;
        this.productos = demo.map(([marca, modelo, categoria, precio, ubicacion, vars], i) => {
            const variantes = vars.map(([color, talla, existencias]) => {
                const k = n++;
                return { color, talla, existencias, sku: `ZP${String(k).padStart(4, "0")}`, codigoBarras: this.generarCodigoBarras(k) };
            });
            return { id: i + 1, marca, modelo, categoria, precio, ubicacion, variantes,
                     totalPares: variantes.reduce((t, v) => t + v.existencias, 0) };
        });
        this.escribir(this.CLAVE, this.productos);
        localStorage.setItem("zapcontrol.productos.consecutivo", String(n - 1));
    }

    obtenerProductos() { return this.productos; }

    totalPares() { return this.productos.reduce((t, p) => t + p.totalPares, 0); }

    variantesPlanas() {
        const filas = [];
        this.productos.forEach(p => p.variantes.forEach(v => filas.push({
            ...v, producto: `${p.marca} ${p.modelo}`, categoria: p.categoria, ubicacion: p.ubicacion, precio: p.precio
        })));
        return filas;
    }

    obtenerPorId(id) { return this.productos.find(p => p.id === id); }

    // SKUs de las variantes que ya aparecen en alguna venta (no se pueden quitar)
    skusVendidos() {
        const vendidos = new Set();
        this.leer("zapcontrol.ventas").forEach(v => (v.items || []).forEach(i => vendidos.add(i.sku)));
        return vendidos;
    }

    // variantes: [{ sku?, color, talla, existencias }]. Las que traen sku ya existían; las demás son nuevas.
    actualizarProducto(id, datos, variantes) {
        const producto = this.obtenerPorId(id);
        if (!producto) return { correcto: false, mensaje: "El producto no existe." };

        const repetido = this.productos.some(p => p.id !== id &&
            p.marca.toLowerCase() === datos.marca.toLowerCase() &&
            p.modelo.toLowerCase() === datos.modelo.toLowerCase());
        if (repetido) return { correcto: false, mensaje: "Ya existe otro producto con esa marca y modelo." };

        const conservadas = new Set(variantes.filter(v => v.sku).map(v => v.sku));
        const quitadas = producto.variantes.filter(v => !conservadas.has(v.sku));
        const vendidos = this.skusVendidos();
        const bloqueada = quitadas.find(v => vendidos.has(v.sku));
        if (bloqueada) {
            return { correcto: false, mensaje: `No se puede quitar la variante ${bloqueada.color} · talla ${bloqueada.talla}: ya tiene ventas registradas.` };
        }

        const copia = JSON.parse(JSON.stringify(producto));
        let consecutivo = this.siguienteConsecutivo();
        const lista = variantes.map(v => {
            if (v.sku) {
                const actual = producto.variantes.find(x => x.sku === v.sku);
                return { ...actual, existencias: Number(v.existencias) };
            }
            const n = consecutivo++;
            return {
                color: v.color, talla: v.talla, existencias: Number(v.existencias),
                sku: `ZP${String(n).padStart(4, "0")}`, codigoBarras: this.generarCodigoBarras(n)
            };
        });

        const categoriaAnterior = producto.categoria;
        producto.marca = datos.marca;
        producto.modelo = datos.modelo;
        producto.categoria = datos.categoria;
        producto.precio = Number(datos.precio);
        producto.ubicacion = datos.ubicacion;
        producto.variantes = lista;
        producto.totalPares = lista.reduce((t, v) => t + v.existencias, 0);

        if (!this.escribir(this.CLAVE, this.productos)) {
            Object.assign(producto, copia);
            return { correcto: false, mensaje: "No fue posible guardar los cambios." };
        }
        localStorage.setItem("zapcontrol.productos.consecutivo", String(consecutivo - 1));

        if (categoriaAnterior !== datos.categoria) {
            const cats = new ModeloCategorias();
            const vieja = cats.categorias.find(c => c.nombre === categoriaAnterior);
            const nueva = cats.categorias.find(c => c.nombre === datos.categoria);
            if (vieja) vieja.productos = Math.max(0, (vieja.productos || 0) - 1);
            if (nueva) nueva.productos = (nueva.productos || 0) + 1;
            cats.guardar();
        }
        return { correcto: true, producto };
    }

    // Busca una variante por SKU y devuelve { producto, variante } (o null)
    buscarVariante(sku) {
        for (const producto of this.productos) {
            const variante = producto.variantes.find(v => v.sku === sku);
            if (variante) return { producto, variante };
        }
        return null;
    }

    // Suma (delta > 0) o resta (delta < 0) existencias de una variante y guarda
    ajustarExistencias(sku, delta) {
        const hallado = this.buscarVariante(sku);
        if (!hallado) return false;
        hallado.variante.existencias = Math.max(0, hallado.variante.existencias + delta);
        hallado.producto.totalPares = hallado.producto.variantes.reduce((t, v) => t + v.existencias, 0);
        return this.escribir(this.CLAVE, this.productos);
    }

    leer(clave) {
        try {
            const dato = JSON.parse(localStorage.getItem(clave));
            if (Array.isArray(dato)) return dato;
        } catch (e) { }
        return [];
    }

    escribir(clave, valor) {
        try { localStorage.setItem(clave, JSON.stringify(valor)); return true; }
        catch (e) { return false; }
    }

    obtenerCategorias() {
        return new ModeloCategorias().obtenerCategorias().map(c => c.nombre);
    }

    obtenerColores() { return this.coloresBase.concat(this.coloresExtra); }

    existeColor(nombre) {
        return this.obtenerColores().some(c => c.nombre.toLowerCase() === nombre.toLowerCase());
    }

    agregarColor(nombre, color) {
        nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        this.coloresExtra.push({ nombre, color });
        return nombre;
    }

    colorDe(nombre) {
        const c = this.obtenerColores().find(x => x.nombre === nombre);
        return c ? c.color : "#cccccc";
    }

    existeProducto(marca, modelo) {
        return this.productos.some(p =>
            p.marca.toLowerCase() === marca.toLowerCase() &&
            p.modelo.toLowerCase() === modelo.toLowerCase());
    }

    siguienteConsecutivo() {
        return (Number(localStorage.getItem("zapcontrol.productos.consecutivo")) || 0) + 1;
    }

    generarCodigoBarras(n) {
        const base = `750123${String(n).padStart(6, "0")}`;
        let suma = 0;
        for (let i = 0; i < base.length; i++) suma += Number(base[i]) * (i % 2 === 0 ? 1 : 3);
        return base + ((10 - (suma % 10)) % 10);
    }

    registrarProducto(datos, variantes) {
        if (this.existeProducto(datos.marca, datos.modelo)) {
            return { correcto: false, mensaje: "Ya existe un producto con esa marca y modelo." };
        }

        const id = this.productos.reduce((m, p) => Math.max(m, p.id), 0) + 1;
        let consecutivo = this.siguienteConsecutivo();

        const lista = variantes.map(v => {
            const n = consecutivo++;
            return {
                color: v.color,
                talla: v.talla,
                existencias: Number(v.existencias),
                sku: `ZP${String(n).padStart(4, "0")}`,
                codigoBarras: this.generarCodigoBarras(n)
            };
        });

        const producto = {
            id,
            marca: datos.marca,
            modelo: datos.modelo,
            categoria: datos.categoria,
            precio: Number(datos.precio),
            ubicacion: datos.ubicacion,
            variantes: lista,
            totalPares: lista.reduce((t, v) => t + v.existencias, 0)
        };

        this.productos.push(producto);
        if (!this.escribir(this.CLAVE, this.productos)) {
            this.productos.pop();
            return { correcto: false, mensaje: "No fue posible guardar el producto." };
        }
        localStorage.setItem("zapcontrol.productos.consecutivo", String(consecutivo - 1));

        const cats = new ModeloCategorias();
        const cat = cats.categorias.find(c => c.nombre === datos.categoria);
        if (cat) { cat.productos = (cat.productos || 0) + 1; cats.guardar(); }

        return { correcto: true, producto };
    }
}