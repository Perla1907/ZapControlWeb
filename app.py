from flask import Flask
from config import Config
from rutas.categorias import categorias_bp

app = Flask(__name__)

# Cargar configuración
app.config.from_object(Config)

# Registrar rutas
app.register_blueprint(categorias_bp)


@app.route("/")
def inicio():
    return "API de ZapControl funcionando"


if __name__ == "__main__":
    app.run()