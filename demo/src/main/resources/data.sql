-- Active: 1763934661541@@localhost@3306@hotel_premier

USE hotel_premier;

-- ==================================================================
-- 1. TABLAS INDEPENDIENTES (Datos Maestros)
-- ==================================================================

-- Direcciones
INSERT INTO Direccion (calle, numero, piso, departamento, cod_postal, localidad, provincia, pais) VALUES 
('Av. Corrientes', 1234, NULL, NULL, '1043', 'CABA', 'Buenos Aires', 'Argentina'),
('Bv. Galvez', 1550, 4, 'B', '3000', 'Santa Fe', 'Santa Fe', 'Argentina'),
('San Martin', 2020, NULL, NULL, '2000', 'Rosario', 'Santa Fe', 'Argentina'),
('Av. Siempre Viva', 742, NULL, NULL, '5500', 'Springfield', 'Mendoza', 'Argentina');

-- Tipos de Habitación (Respetando el CHECK constraint del schema)
INSERT INTO TipoHabitacion (descripcion, cantidad_camas_kingSize, cantidad_camas_individuales, cantidad_camas_dobles) VALUES 
('INDIVIDUAL ESTANDAR', 0, 1, 0),
('DOBLE ESTANDAR', 0, 0, 1),
('DOBLE SUPERIOR', 1, 0, 0),
('SUPERIOR FAMILY PLAN', 0, 3, 1),
('SUITE', 1, 0, 1);

-- Conserjes
INSERT INTO Conserje (nombre, contrasena) VALUES 
('admin', 'admin123'),
('juan', 'seguro123');

-- Responsables de Pago (Entidad abstracta en el modelo, tabla concreta en BD)
INSERT INTO Responsable_De_Pago (razon_social) VALUES 
('Juan Perez'),             -- ID 1: Será Persona Física
('Tech Solutions S.A.'),    -- ID 2: Será Persona Jurídica
('Maria Gomez');            -- ID 3: Será Persona Física

-- ==================================================================
-- 2. MEDIOS DE PAGO (Datos base para referenciar)
-- ==================================================================

INSERT INTO Efectivo (ID_Efectivo) VALUES (1); -- ID 1

INSERT INTO Moneda_Extranjera (tipo) VALUES ('USD'), ('EUR');

INSERT INTO Tarjeta_De_Credito (Numero_tarjeta_Credito, saldo, fecha_vencimiento, nombre_titular, emisor, limite_credito) VALUES 
('4545000011112222', 500000.00, '12/28', 'JUAN PEREZ', 'VISA', 1000000.00);

INSERT INTO Tarjeta_De_Debito (Numero_tarjeta_Debito, saldo, fecha_vencimiento, nombre_titular, banco_asociado, tipo, numero_cuenta) VALUES 
('5050000011112222', 150000.00, '10/26', 'MARIA GOMEZ', 'Banco Nacion', 'MASTERCARD', 'CC-123456789');

-- ==================================================================
-- 3. ENTIDADES PRINCIPALES (Dependen de las anteriores)
-- ==================================================================

-- Huéspedes (Respetando CHECK de Posicion_IVA)
INSERT INTO Huesped (nombre, apellido, nro_documento, tipo_documento, cuit, posicion_IVA, edad, telefono, email, fecha_nacimiento, nacionalidad, ocupacion, ID_Direccion) VALUES 
('Juan', 'Perez', '30111222', 'DNI', NULL, 'CONSUMIDOR_FINAL', 35, '341111222', 'juan@mail.com', '1988-05-20', 'Argentina', 'Empleado', 1),
('Maria', 'Gomez', '28444555', 'DNI', '27284445550', 'RESPONSABLE_INSCRIPTO', 40, '342555666', 'maria@tech.com', '1983-02-15', 'Argentina', 'Gerente', 2),
('Carlos', 'Lopez', '12345678', 'PASAPORTE', NULL, 'CONSUMIDOR_FINAL', 29, '11223344', 'carlos@mail.com', '1994-08-10', 'Uruguay', 'Turista', 3);

-- Habitaciones (Respetando CHECK de estado)
INSERT INTO Habitacion (estado, cantidad, costo, capacidad, porcentaje_descuento, ID_TipoHabitacion) VALUES 
('OCUPADA', 1, 50800.00, 1, 0.0, 1),  -- Hab 1 (Individual)
('LIBRE', 1, 70230.00, 2, 0.0, 2),   -- Hab 2 (Doble Estándar)
('RESERVADA', 1, 90560.00, 2, 10.0, 3), -- Hab 3 (Doble Superior)
('LIBRE', 1, 128600.00, 2, 20.0, 5);  -- Hab 4 (Suite)

-- Subtipos de Personas (Vinculación)
INSERT INTO Persona_Fisica (ID_Huesped, ID_Responsable) VALUES 
(1, 1), -- Juan Perez paga como Juan Perez
(3, 3); -- Carlos Lopez paga como Maria Gomez (ejemplo)

INSERT INTO Persona_Juridica (nombre, apellido, telefono, CUIT_Responsable, razon_social, posicion_IVA, ID_Direccion, ID_Huesped) VALUES 
('Maria', 'Gomez', '342555666', '30112233445', 'Tech Solutions S.A.', 'RESPONSABLE_INSCRIPTO', 2, 2);
-- Nota: Tech Solutions S.A. es la empresa representada por Maria

-- ==================================================================
-- 4. OPERACIONES (Reservas, Estadías, Consumos)
-- ==================================================================

-- Reservas
INSERT INTO Reserva (estado_reserva, fecha_entrada, fecha_salida, ID_Huesped) VALUES 
('CONFIRMADA', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 1), -- Reserva actual para Juan
('PENDIENTE', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 3); -- Reserva futura para Carlos

-- Relación Reserva-Habitación
INSERT INTO Reserva_Habitacion (ID_Reserva, ID_Habitacion) VALUES 
(1, 1), -- Juan reservó la habitación 1
(2, 3); -- Carlos reservó la habitación 3

-- Estadía (Debe tener una Reserva asociada según el schema que es NOT NULL UNIQUE)
INSERT INTO Estadia (check_in, check_out, cantidad_dias, cantidad_huespedes, cantidad_habitaciones, ID_Reserva, ID_Habitacion) VALUES 
(NOW(), NULL, 5, 1, 1, 1, 1); 
-- Estadía correspondiente a la Reserva 1, en la Habitación 1

-- Consumos
INSERT INTO Consumo (tipo, monto, ID_Estadia) VALUES 
('Bar - Bebidas', 1500.00, 1),
('Lavandería', 3000.00, 1);

-- ==================================================================
-- 5. FACTURACIÓN Y PAGOS
-- ==================================================================

-- Factura (Tipo A o B, Estado PENDIENTE, PAGADA, ANULADA)
INSERT INTO Factura (monto, tipo, estado, ID_Estadia, ID_Responsable) VALUES 
(55300.00, 'B', 'PAGADA', 1, 1); -- Factura para Juan Perez (Costo hab + consumos)

-- Pago
INSERT INTO Pago (monto, ID_Factura) VALUES 
(55300.00, 1);

-- Medio de Pago (Detalle del pago)
INSERT INTO Medio_de_Pago (monto, fecha_de_pago, ID_Pago, ID_Efectivo, Numero_Tarjeta_Credito) VALUES 
(55300.00, NOW(), 1, NULL, '4545000011112222'); -- Pagó todo con tarjeta VISA