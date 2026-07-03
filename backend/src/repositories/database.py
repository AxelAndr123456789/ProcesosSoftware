import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    url = os.getenv("DATABASE_URL")
    if not url:
        raise Exception("DATABASE_URL environment variable is not set")
    conn = psycopg2.connect(url)
    return conn
