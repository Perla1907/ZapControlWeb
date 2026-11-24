import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Configuración de Flask
    SECRET_KEY = os.getenv("SECRET_KEY")
    DEBUG = True

    # Configuración de respuestas JSON
    JSON_SORT_KEYS = False