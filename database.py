import os 
from contextlib import contextmanager
import pyodbc
from dotenv import load_dotenv

load_dotenv()

def odbc_value(value):
    return '{'+value.replace('}','}}')+'}'

@contextmanager
def conexion():
    # Windows se usa la identidad de quien ejecuta Python
    
    cadena = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={odbc_value(os.environ['DB_SERVER'])};"
        f"DATABASE={odbc_value(os.getenv('DB_NAME', 'ZapControl'))};"
        'Trusted_Connection=yes;Encrypt=yes;'
        f"TrustServerCertificate={os.getenv('DB_TRUST_CERT', 'NO')};"
    )
    
    cn = pyodbc.connect(cadena, timeout=5)
    try:
        yield cn
        cn.commit()
    except Exception:
        cn.rollback()
        raise
    finally:
        cn.close()