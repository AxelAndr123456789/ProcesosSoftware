from .database import get_db_connection

class ReservaRepository:
    def get_all(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_get_reservas()")
        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results

    def create(self, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_create_reserva(%s, %s, %s, %s)",
                      (data.cliente, data.id_servicio, data.estado_reserva, data.estado_pago))
        conn.commit()
        cursor.close()
        conn.close()

    def update(self, id, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_update_reserva(%s, %s, %s, %s, %s)",
                      (id, data.cliente, data.id_servicio, data.estado_reserva, data.estado_pago))
        conn.commit()
        cursor.close()
        conn.close()

    def delete(self, id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sp_delete_reserva(%s)", (id,))
        conn.commit()
        cursor.close()
        conn.close()
