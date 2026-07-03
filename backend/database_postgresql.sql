CREATE DATABASE horizon_db;

-- ============================================
-- TABLAS
-- ============================================

CREATE TABLE operadores (
    id_operador SERIAL PRIMARY KEY,
    contacto VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    destino VARCHAR(200) NOT NULL,
    inversion DECIMAL(10,2) NOT NULL,
    capacidad INT NOT NULL,
    id_operador INT NOT NULL REFERENCES operadores(id_operador),
    estado VARCHAR(20) DEFAULT 'Disponible'
);

CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    cliente VARCHAR(200) NOT NULL,
    id_servicio INT NOT NULL REFERENCES servicios(id_servicio),
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_reserva VARCHAR(20) DEFAULT 'Pendiente',
    estado_pago VARCHAR(20) DEFAULT 'Pendiente'
);

CREATE TABLE reclamos (
    id_reclamo SERIAL PRIMARY KEY,
    id_reserva INT NOT NULL REFERENCES reservas(id_reserva),
    cliente VARCHAR(200) NOT NULL,
    motivo VARCHAR(300) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    fecha_reclamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP NULL
);

CREATE TABLE feedback (
    id_feedback SERIAL PRIMARY KEY,
    id_reserva INT NOT NULL REFERENCES reservas(id_reserva),
    cliente VARCHAR(200) NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_feedback TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FUNCIONES (reemplazan stored procedures)
-- ============================================

-- Operadores
CREATE OR REPLACE FUNCTION sp_get_operadores()
RETURNS TABLE(id_operador INT, contacto VARCHAR, telefono VARCHAR, estado VARCHAR, fecha_registro TIMESTAMP) AS $$
BEGIN
    RETURN QUERY SELECT o.id_operador, o.contacto, o.telefono, o.estado, o.fecha_registro FROM operadores o;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_create_operador(p_contacto VARCHAR, p_telefono VARCHAR, p_estado VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO operadores (contacto, telefono, estado) VALUES (p_contacto, p_telefono, p_estado);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_update_operador(p_id INT, p_contacto VARCHAR, p_telefono VARCHAR, p_estado VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE operadores SET contacto = p_contacto, telefono = p_telefono, estado = p_estado WHERE id_operador = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_delete_operador(p_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM operadores WHERE id_operador = p_id;
END;
$$ LANGUAGE plpgsql;

-- Servicios
CREATE OR REPLACE FUNCTION sp_get_servicios()
RETURNS TABLE(id_servicio INT, nombre VARCHAR, destino VARCHAR, inversion DECIMAL, capacidad INT, id_operador INT, estado VARCHAR, nombre_operador VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT s.id_servicio, s.nombre, s.destino, s.inversion, s.capacidad, s.id_operador, s.estado, o.contacto FROM servicios s LEFT JOIN operadores o ON s.id_operador = o.id_operador;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_create_servicio(p_nombre VARCHAR, p_destino VARCHAR, p_inversion DECIMAL, p_capacidad INT, p_id_operador INT, p_estado VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO servicios (nombre, destino, inversion, capacidad, id_operador, estado) VALUES (p_nombre, p_destino, p_inversion, p_capacidad, p_id_operador, p_estado);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_update_servicio(p_id INT, p_nombre VARCHAR, p_destino VARCHAR, p_inversion DECIMAL, p_capacidad INT, p_id_operador INT, p_estado VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE servicios SET nombre = p_nombre, destino = p_destino, inversion = p_inversion, capacidad = p_capacidad, id_operador = p_id_operador, estado = p_estado WHERE id_servicio = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_delete_servicio(p_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM servicios WHERE id_servicio = p_id;
END;
$$ LANGUAGE plpgsql;

-- Reservas
CREATE OR REPLACE FUNCTION sp_get_reservas()
RETURNS TABLE(id_reserva INT, cliente VARCHAR, id_servicio INT, fecha_reserva TIMESTAMP, estado_reserva VARCHAR, estado_pago VARCHAR, nombre_servicio VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT r.id_reserva, r.cliente, r.id_servicio, r.fecha_reserva, r.estado_reserva, r.estado_pago, s.nombre FROM reservas r LEFT JOIN servicios s ON r.id_servicio = s.id_servicio;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_create_reserva(p_cliente VARCHAR, p_id_servicio INT, p_estado_reserva VARCHAR, p_estado_pago VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO reservas (cliente, id_servicio, estado_reserva, estado_pago) VALUES (p_cliente, p_id_servicio, p_estado_reserva, p_estado_pago);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_update_reserva(p_id INT, p_cliente VARCHAR, p_id_servicio INT, p_estado_reserva VARCHAR, p_estado_pago VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE reservas SET cliente = p_cliente, id_servicio = p_id_servicio, estado_reserva = p_estado_reserva, estado_pago = p_estado_pago WHERE id_reserva = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_delete_reserva(p_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM reservas WHERE id_reserva = p_id;
END;
$$ LANGUAGE plpgsql;

-- Reclamos
CREATE OR REPLACE FUNCTION sp_get_reclamos()
RETURNS TABLE(id_reclamo INT, id_reserva INT, cliente VARCHAR, motivo VARCHAR, descripcion TEXT, estado VARCHAR, fecha_reclamo TIMESTAMP, fecha_resolucion TIMESTAMP, cliente_reserva VARCHAR, nombre_servicio VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT rc.id_reclamo, rc.id_reserva, rc.cliente, rc.motivo, rc.descripcion, rc.estado, rc.fecha_reclamo, rc.fecha_resolucion, r.cliente, s.nombre FROM reclamos rc LEFT JOIN reservas r ON rc.id_reserva = r.id_reserva LEFT JOIN servicios s ON r.id_servicio = s.id_servicio;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_create_reclamo(p_id_reserva INT, p_cliente VARCHAR, p_motivo VARCHAR, p_descripcion TEXT, p_estado VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO reclamos (id_reserva, cliente, motivo, descripcion, estado) VALUES (p_id_reserva, p_cliente, p_motivo, p_descripcion, p_estado);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_update_reclamo(p_id INT, p_id_reserva INT, p_cliente VARCHAR, p_motivo VARCHAR, p_descripcion TEXT, p_estado VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE reclamos SET id_reserva = p_id_reserva, cliente = p_cliente, motivo = p_motivo, descripcion = p_descripcion, estado = p_estado WHERE id_reclamo = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_delete_reclamo(p_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM reclamos WHERE id_reclamo = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_resolve_reclamo(p_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE reclamos SET estado = 'Resuelto', fecha_resolucion = CURRENT_TIMESTAMP WHERE id_reclamo = p_id;
END;
$$ LANGUAGE plpgsql;

-- Feedback
CREATE OR REPLACE FUNCTION sp_get_feedback()
RETURNS TABLE(id_feedback INT, id_reserva INT, cliente VARCHAR, calificacion INT, comentario TEXT, fecha_feedback TIMESTAMP, cliente_reserva VARCHAR, nombre_servicio VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT fb.id_feedback, fb.id_reserva, fb.cliente, fb.calificacion, fb.comentario, fb.fecha_feedback, r.cliente, s.nombre FROM feedback fb LEFT JOIN reservas r ON fb.id_reserva = r.id_reserva LEFT JOIN servicios s ON r.id_servicio = s.id_servicio;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_create_feedback(p_id_reserva INT, p_cliente VARCHAR, p_calificacion INT, p_comentario TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO feedback (id_reserva, cliente, calificacion, comentario) VALUES (p_id_reserva, p_cliente, p_calificacion, p_comentario);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_update_feedback(p_id INT, p_id_reserva INT, p_cliente VARCHAR, p_calificacion INT, p_comentario TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE feedback SET id_reserva = p_id_reserva, cliente = p_cliente, calificacion = p_calificacion, comentario = p_comentario WHERE id_feedback = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_delete_feedback(p_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM feedback WHERE id_feedback = p_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO operadores (contacto, telefono, estado) VALUES
('Carlos Rodriguez', '999888777', 'Activo'),
('Maria Lopez', '999888778', 'Activo'),
('Juan Perez', '999888779', 'Activo');

INSERT INTO servicios (nombre, destino, inversion, capacidad, id_operador, estado) VALUES
('Tour Machu Picchu', 'Cusco', 450.00, 20, 1, 'Disponible'),
('Amazon Jungle Tour', 'Iquitos', 380.00, 15, 2, 'Disponible'),
('Colca Canyon Trek', 'Arequipa', 280.00, 12, 3, 'Disponible'),
('Lake Titicaca Tour', 'Puno', 320.00, 18, 1, 'Disponible'),
('Nazca Lines Flight', 'Nazca', 150.00, 8, 2, 'Disponible');

INSERT INTO reservas (cliente, id_servicio, estado_reserva, estado_pago) VALUES
('Pedro Sanchez', 1, 'Confirmada', 'Pagado'),
('Ana Garcia', 2, 'Pendiente', 'Pendiente'),
('Luis Torres', 3, 'Confirmada', 'Pagado'),
('Sofia Martinez', 4, 'Cancelada', 'Reembolsado'),
('Diego Ramirez', 5, 'Confirmada', 'Pagado');

INSERT INTO reclamos (id_reserva, cliente, motivo, descripcion, estado) VALUES
(1, 'Pedro Sanchez', 'Retraso en el servicio', 'El bus llego 2 horas tarde', 'Pendiente'),
(3, 'Luis Torres', 'Guia no habla ingles', 'Solicite guia bilingue y no fue proporcionado', 'Resuelto'),
(5, 'Diego Ramirez', 'Vuelo cancelado', 'El vuelo sobre lineas de Nazca fue cancelado por clima', 'Pendiente');

INSERT INTO feedback (id_reserva, cliente, calificacion, comentario) VALUES
(1, 'Pedro Sanchez', 4, 'Muy buena experiencia, solo el retraso del bus'),
(3, 'Luis Torres', 3, 'El tour estuvo bien pero el guia no cumplio'),
(5, 'Diego Ramirez', 5, 'Excelente tour, supero mis expectativas');
