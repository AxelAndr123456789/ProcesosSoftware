from .database import get_db_connection

class FeedbackRepository:
    def get_all(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_get_feedback()")
        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results

    def create(self, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_create_feedback(%s, %s, %s, %s)",
                      (data.id_reserva, data.cliente, data.calificacion, data.comentario))
        conn.commit()
        cursor.close()
        conn.close()

    def update(self, id, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_update_feedback(%s, %s, %s, %s, %s)",
                      (id, data.id_reserva, data.cliente, data.calificacion, data.comentario))
        conn.commit()
        cursor.close()
        conn.close()

    def delete(self, id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_delete_feedback(%s)", (id,))
        conn.commit()
        cursor.close()
        conn.close()
