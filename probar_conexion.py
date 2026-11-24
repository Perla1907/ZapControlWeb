from database import conexion

with conexion() as cn:
    cursor = cn.cursor()
    cursor.execute("SELECT DB_NAME()")
    fila = cursor.fetchone()
    print("Conexion correcta")
    print("Base de datos:", fila[0])