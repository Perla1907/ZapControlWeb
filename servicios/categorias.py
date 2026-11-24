from database import conexion


def obtener_categorias():
    with conexion() as cn:
        cursor = cn.cursor()

        cursor.execute("""
            SELECT idCategoria, clave, categoria, color, descripcion FROM Categorias ORDER BY categoria
        """)

        categorias = cursor.fetchall()

        return [
            {
                "idCategoria": fila.idCategoria,
                "clave": fila.clave,
                "categoria": fila.categoria,
                "color": fila.color,
                "descripcion": fila.descripcion
            }
            for fila in categorias
        ]