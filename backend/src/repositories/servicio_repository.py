from .database import get_db_connection

class ServicioRepository:
    def get_all(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_get_servicios()")
        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results

    def create(self, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_create_servicio(%s, %s, %s, %s, %s, %s)",
                      (data.nombre, data.destino, data.inversion, data.capacidad, data.id_operador, data.estado))
        conn.commit()
        cursor.close()
        conn.close()

    def update(self, id, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_update_servicio(%s, %s, %s, %s, %s, %s, %s)",
                      (id, data.nombre, data.destino, data.inversion, data.capacidad, data.id_operador, data.estado))
        conn.commit()
        cursor.close()
        conn.close()

    def delete(self, id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_delete_servicio(%s)", (id,))
        conn.commit()
        cursor.close()
        conn.close()
