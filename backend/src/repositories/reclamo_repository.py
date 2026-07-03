from .database import get_db_connection

class ReclamoRepository:
    def get_all(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_get_reclamos()")
        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results

    def create(self, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_create_reclamo(%s, %s, %s, %s, %s)",
                      (data.id_reserva, data.cliente, data.motivo, data.descripcion, data.estado))
        conn.commit()
        cursor.close()
        conn.close()

    def update(self, id, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_update_reclamo(%s, %s, %s, %s, %s, %s)",
                      (id, data.id_reserva, data.cliente, data.motivo, data.descripcion, data.estado))
        conn.commit()
        cursor.close()
        conn.close()

    def delete(self, id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_delete_reclamo(%s)", (id,))
        conn.commit()
        cursor.close()
        conn.close()

    def resolve(self, id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_resolve_reclamo(%s)", (id,))
        conn.commit()
        cursor.close()
        conn.close()
