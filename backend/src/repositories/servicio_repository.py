from .database import get_db_connection

class ServicioRepository:
    def get_all(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_get_servicios")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results

    def create(self, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_create_servicio ?, ?, ?, ?, ?, ?", (data.nombre, data.destino, data.inversion, data.capacidad, data.id_operador, data.estado))
        conn.commit()
        cursor.close()
        conn.close()

    def update(self, id, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_update_servicio ?, ?, ?, ?, ?, ?, ?", (id, data.nombre, data.destino, data.inversion, data.capacidad, data.id_operador, data.estado))
        conn.commit()
        cursor.close()
        conn.close()

    def delete(self, id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_delete_servicio ?", (id,))
        conn.commit()
        cursor.close()
        conn.close()
