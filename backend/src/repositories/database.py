import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    server = os.getenv("DB_SERVER").replace("\\\\", "\\") # Aseguramos una sola barra
    database = os.getenv("DB_NAME")
    username = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    driver = os.getenv("DB_DRIVER")
    
    # Intentamos conexión normal
    conn_str = f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;"
    
    # Intento alternativo (Directo a IP/Puerto si el nombre falla)
    # SERVER=127.0.0.1,1433
    alt_server = server.split("\\")[0] + ",1433"
    alt_conn_str = f"DRIVER={driver};SERVER={alt_server};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;"

    try:
        return pyodbc.connect(conn_str, timeout=5)
    except Exception:
        try:
            print(f"DEBUG: Falló conexión por instancia, intentando por puerto 1433 en {alt_server}...")
            return pyodbc.connect(alt_conn_str, timeout=5)
        except Exception as e:
            print(f"CRITICAL ERROR: No se pudo conectar a SQL Server.")
            print(f"Verifica que TCP/IP esté habilitado y el servicio SQL Server Browser iniciado.")
            print(f"Detalles del error: {e}")
            raise e
