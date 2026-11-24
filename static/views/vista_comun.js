// Utilidades de vista compartidas por Dashboard, Productos, Inventario, Catálogo y Usuarios
class VistaComun {
    static dinero(n) {
        return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Insignia de existencias: agotado / bajo / disponible
    static insigniaStock(n) {
        const s = document.createElement("span");
        s.className = "insignia " + (n === 0 ? "agotado" : n <= 3 ? "bajo" : "ok");
        s.textContent = n === 0 ? "Agotado" : n <= 3 ? `Bajo · ${n}` : `${n} pares`;
        return s;
    }

    // filas: arreglo de arreglos; cada celda es texto o un nodo del DOM
    static llenarTabla(tbody, filas, columnas, textoVacio) {
        tbody.replaceChildren();
        if (filas.length === 0) {
            const tr = document.createElement("tr"), td = document.createElement("td");
            td.colSpan = columnas; td.className = "vacio"; td.textContent = textoVacio;
            tr.appendChild(td); tbody.appendChild(tr);
            return;
        }
        filas.forEach(celdas => {
            const tr = document.createElement("tr");
            celdas.forEach(c => {
                const td = document.createElement("td");
                if (c instanceof Node) td.appendChild(c); else td.textContent = c;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    static punto(color) {
        const p = document.createElement("span");
        p.className = "punto"; p.style.background = color;
        return p;
    }

    static fechaHora(iso) {
        return new Date(iso).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
    }

    static mensaje(el, texto, tipo) { el.textContent = texto; el.className = `aviso ${tipo}`; }
}
