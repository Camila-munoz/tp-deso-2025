-- Active: 1764638966350@@localhost@3306@hotel_premier

USE hotel_premier;

-- ==================================================================
-- 1. DATOS MAESTROS (Independientes)
-- ==================================================================

-- 1.1 Direcciones
INSERT INTO Direccion (calle, numero, piso, departamento, cod_postal, localidad, provincia, pais) VALUES 
('Av. Corrientes', 1234, NULL, NULL, '1043', 'CABA', 'Buenos Aires', 'Argentina'),
('Bv. Galvez', 1550, 4, 'B', '3000', 'Santa Fe', 'Santa Fe', 'Argentina'),
('San Martin', 2020, NULL, NULL, '2000', 'Rosario', 'Santa Fe', 'Argentina'),
('Av. Siempre Viva', 742, NULL, NULL, '5500', 'Springfield', 'Mendoza', 'Argentina'),
('Calle Falsa', 123, NULL, NULL, '1234', 'Shelbyville', 'Mendoza', 'Argentina'),
('Calle Luna', 456, 2, 'A', '5678', 'Capital', 'Mendoza', 'Argentina');


-- 1.2 Tipos de Habitación
INSERT INTO TipoHabitacion (ID_TipoHabitacion, descripcion, cantidad_camas_kingSize, cantidad_camas_individuales, cantidad_camas_dobles) VALUES 
(1, 'INDIVIDUAL ESTANDAR', 0, 1, 0),
(2, 'DOBLE ESTANDAR', 0, 2, 1),
(3, 'DOBLE SUPERIOR', 1, 2, 1),
(4, 'SUPERIOR FAMILY PLAN', 0, 3, 2),
(5, 'SUITE', 1, 0, 1);

-- 1.3 Conserjes (Usuarios del sistema)
INSERT INTO Conserje (nombre, contrasena) VALUES 
('admin', 'admin123'),
('juan', 'seguro123'),
('ana', 'conserje456'),
('maria', 'hotel789');

-- ==================================================================
-- 2. HABITACIONES
-- ==================================================================

-- A. 10 Individuales Estándar ($50.800)
INSERT INTO Habitacion (ID_Habitacion, numero, estado, cantidad, costo, capacidad, porcentaje_descuento, ID_TipoHabitacion) VALUES 
(1, '1', 'LIBRE', 1, 50800.00, 1, 0.0, 1),
(2, '2', 'LIBRE', 1, 50800.00, 1, 0.0, 1),
(3, '3', 'LIBRE', 1, 50800.00, 1, 0.0, 1),
(4, '4', 'LIBRE', 1, 50800.00, 1, 0.0, 1),
(5, '5', 'LIBRE', 1, 50800.00, 1, 0.0, 1),
(6, '6', 'LIBRE', 1, 50800.00, 1, 0.0, 1),
(7, '7', 'LIBRE', 1, 50800.00, 1, 0.0, 1),
(8, '8', 'LIBRE', 1, 50800.00, 1, 0.0, 1),
(9, '9', 'LIBRE', 1, 50800.00, 1, 0.0, 1),
(10, '10', 'LIBRE', 1, 50800.00, 1, 0.0, 1);

-- B. 18 Dobles Estándar ($70.230)
INSERT INTO Habitacion (ID_Habitacion, numero, estado, cantidad, costo, capacidad, porcentaje_descuento, ID_TipoHabitacion) VALUES 
(11, '11', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(12, '12', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(13, '13', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(14, '14', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(15, '15', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(16, '16', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(17, '17', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(18, '18', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(19, '19', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(20, '20', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(21, '21', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(22, '22', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(23, '23', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(24, '24', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(25, '25', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(26, '26', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(27, '27', 'LIBRE', 1, 70230.00, 2, 0.0, 2),
(28, '28', 'LIBRE', 1, 70230.00, 2, 0.0, 2);

-- C. 8 Dobles Superior ($90.560)
INSERT INTO Habitacion (ID_Habitacion, numero, estado, cantidad, costo, capacidad, porcentaje_descuento, ID_TipoHabitacion) VALUES 
(29, '29', 'LIBRE', 1, 90560.00, 2, 10.0, 3), 
(30, '30', 'LIBRE', 1, 90560.00, 2, 10.0, 3),
(31, '31', 'LIBRE', 1, 90560.00, 2, 10.0, 3),
(32, '32', 'LIBRE', 1, 90560.00, 2, 10.0, 3),
(33, '33', 'LIBRE', 1, 90560.00, 2, 10.0, 3),
(34, '34', 'LIBRE', 1, 90560.00, 2, 10.0, 3),
(35, '35', 'LIBRE', 1, 90560.00, 2, 10.0, 3),
(36, '36', 'LIBRE', 1, 90560.00, 2, 10.0, 3);

-- D. 10 Superior Family Plan ($110.500)
INSERT INTO Habitacion (ID_Habitacion, numero, estado, cantidad, costo, capacidad, porcentaje_descuento, ID_TipoHabitacion) VALUES 
(37, '37', 'LIBRE', 1, 110500.00, 5, 15.0, 4),
(38, '38', 'LIBRE', 1, 110500.00, 5, 15.0, 4),
(39, '39', 'LIBRE', 1, 110500.00, 5, 15.0, 4),
(40, '40', 'LIBRE', 1, 110500.00, 5, 15.0, 4),
(41, '41', 'LIBRE', 1, 110500.00, 5, 15.0, 4),
(42, '42', 'LIBRE', 1, 110500.00, 5, 15.0, 4),
(43, '43', 'LIBRE', 1, 110500.00, 5, 15.0, 4),
(44, '44', 'LIBRE', 1, 110500.00, 5, 15.0, 4),
(45, '45', 'LIBRE', 1, 110500.00, 5, 15.0, 4),
(46, '46', 'LIBRE', 1, 110500.00, 5, 15.0, 4);

-- E. 2 Suites Doble ($128.600)
INSERT INTO Habitacion (ID_Habitacion, numero, estado, cantidad, costo, capacidad, porcentaje_descuento, ID_TipoHabitacion) VALUES 
(47, '47', 'LIBRE', 1, 128600.00, 2, 20.0, 5),
(48, '48', 'LIBRE', 1, 128600.00, 2, 20.0, 5);

-- ==================================================================
-- 3. HUESPEDES
-- ==================================================================
INSERT INTO Huesped (nombre, apellido, nro_documento, tipo_documento, cuit, posicion_IVA, edad, telefono, email, nacionalidad, ID_Direccion) VALUES 
('Lionel', 'Messi', '10101010', 'DNI', NULL, 'CONSUMIDOR_FINAL', 36, '341111222', 'lio@mail.com', 'Argentina', 1),
('Maria', 'Becerra', '20202020', 'DNI', '27202020201', 'RESPONSABLE_INSCRIPTO', 24, '11223344', 'maria@music.com', 'Argentina', 2),
('Brad', 'Pitt', '99887766', 'PASAPORTE', NULL, 'CONSUMIDOR_FINAL', 60, '15550000', 'brad@hollywood.com', 'EEUU', 4),
('Angelina', 'Jolie', '66778899', 'PASAPORTE', NULL, 'CONSUMIDOR_FINAL', 55, '15551111', 'angelina@hollywood.com', 'EEUU', 4),
('Carlos', 'Gonzalez', '30303030', 'DNI', '27303030303', 'MONOTRIBUTISTA', 40, '22334455', 'carlos@gonzalez.com', 'Argentina', 3),
('Sofia', 'Lopez', '40404040', 'DNI', NULL, 'CONSUMIDOR_FINAL', 30, '33445566', 'sofia@lopez.com', 'Argentina', 2),
('John', 'Doe', '11223344', 'PASAPORTE', NULL, 'CONSUMIDOR_FINAL', 45, '44556677', 'john@doe.com', 'USA', 5),
('Jane', 'Smith', '55667788', 'PASAPORTE', NULL, 'CONSUMIDOR_FINAL', 38, '55667788', 'jane@smith.com', 'USA', 5),
('Pedro', 'Alvarez', '50505050', 'DNI', '27505050505', 'RESPONSABLE_INSCRIPTO', 28, '66778899', 'pedro@alvarez.com', 'Argentina', 3),
('Lucia', 'Fernandez', '60606060', 'DNI', NULL, 'CONSUMIDOR_FINAL', 32, '77889900', 'lucia@fernandez.com', 'Argentina', 2),
('Michael', 'Johnson', '33445566', 'PASAPORTE', NULL, 'CONSUMIDOR_FINAL', 50, '88990011', 'michael@johnson.com', 'USA', 5),
('Emily', 'Davis', '77889900', 'PASAPORTE', NULL, 'CONSUMIDOR_FINAL', 29, '99001122', 'emily@davis.com', 'USA', 5),
('Diego', 'Maradona', '70707070', 'DNI', NULL, 'CONSUMIDOR_FINAL', 60, '10111213', 'diego@maradona.com', 'Argentina', 1),
('Carlota', 'Perez', '80808080', 'DNI', '27808080808', 'MONOTRIBUTISTA', 35, '12131415', 'carlota@perez.com', 'Argentina', 2);