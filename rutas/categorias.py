from flask import Blueprint, jsonify
from servicios.categorias import obtener_categorias

categorias_bp = Blueprint("categorias", __name__)

@categorias_bp.route("/api/categorias", methods=["GET"])
def listar_categorias():
    try:
        categorias = obtener_categorias()

        return jsonify(categorias), 200

    except Exception:
        return jsonify({
            "error": "No fue posible consultar las categorías"
        }), 500