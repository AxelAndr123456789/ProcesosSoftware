from .database import get_db_connection

class ReservaRepository:
    def get_all(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_get_reservas")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results

    def create(self, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_create_reserva ?, ?, ?, ?", (data.cliente, data.id_servicio, data.estado_reserva, data.estado_pago))
        conn.commit()
        cursor.close()
        conn.close()

    def update(self, id, data):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_update_reserva ?, ?, ?, ?, ?", (id, data.cliente, data.id_servicio, data.estado_reserva, data.estado_pago))
        conn.commit()
        cursor.close()
        conn.close()

    def delete(self, id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_delete_reserva ?", (id,))
        conn.commit()
        cursor.close()
        conn.close()
