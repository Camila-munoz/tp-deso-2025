-- 1. PRIMERO CREAMOS LAS TABLAS INDEPENDIENTES (SIN CLAVES FORÁNEAS COMPLEJAS)
CREATE DATABASE IF NOT EXISTS hotel_premier;
USE hotel_premier;
CREATE TABLE IF NOT EXISTS Direccion (
    ID_Direccion INT AUTO_INCREMENT PRIMARY KEY,
    calle VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    piso VARCHAR(20) NULL,
    departamento VARCHAR(20) NULL,
    cod_postal VARCHAR(20) NOT NULL,
    localidad VARCHAR(20) NOT NULL,
    pais VARCHAR(20) NOT NULL,
    provincia VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS Categoria (
    ID_Categoria INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Tipo_Habitacion (
    ID_TipoHabitacion INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Conserje (
    ID_Conserje INT AUTO_INCREMENT PRIMARY KEY,
    contraseña VARCHAR(20) NOT NULL,
    nombre VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS Efectivo (
    ID_Efectivo INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Moneda_extranjera (
    ID_Moneda_Extranjera INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(20)
);

-- 2. CREAMOS HUESPED (Agregué ID_Huesped porque otras tablas lo buscan)

CREATE TABLE IF NOT EXISTS Huesped (
    ID_Huesped INT AUTO_INCREMENT PRIMARY KEY,
    nro_documento VARCHAR(50) NOT NULL UNIQUE,
    tipo_documento VARCHAR(50) NOT NULL,
    nombre VARCHAR(25) NOT NULL,
    apellido VARCHAR(25) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(50) NOT NULL,
    nacionalidad VARCHAR(100) NOT NULL,
    ocupacion VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    posicion_IVA VARCHAR(30) NOT NULL CHECK (posicion_IVA IN ('CONSUMIDOR_FINAL', 'RESPONSABLE_INSCRIPTO', 'MONOTRIBUTO', 'EXENTO')),
    cuit VARCHAR(15) NULL,
    ID_Direccion INT NULL,
    FOREIGN KEY (ID_Direccion) REFERENCES Direccion(ID_Direccion) ON DELETE SET NULL ON UPDATE CASCADE
    -- Nota: Saque ID_Estadia de aqui para evitar error circular. Se vincula a través de la Reserva/Estadia.
);

-- 3. RESPONSABLE DE PAGO (Quitamos ID_Factura para romper el ciclo circular)

CREATE TABLE IF NOT EXISTS Responsable_de_pago (
    ID_Responsable INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(100) -- Agregado para dar contexto
);

-- 4. SUBTIPOS DE PERSONAS

CREATE TABLE IF NOT EXISTS Persona_Fisica (
    ID_Persona_Fisica INT AUTO_INCREMENT PRIMARY KEY,
    ID_Huesped INT NOT NULL,
    ID_Responsable INT NOT NULL,
    FOREIGN KEY (ID_Huesped) REFERENCES Huesped(ID_Huesped) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_Responsable) REFERENCES Responsable_de_pago(ID_Responsable) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Persona_Juridica (
    ID_Persona_Juridica INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    apellido VARCHAR(20) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    CUIT_responsable VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(255) NOT NULL,
    posicion_IVA VARCHAR(30) NOT NULL CHECK (posicion_IVA IN ('CONSUMIDOR_FINAL', 'RESPONSABLE_INSCRIPTO', 'MONOTRIBUTO', 'EXENTO')),
    ID_Direccion INT NOT NULL,
    ID_Huesped INT NULL, -- Agregado porque estaba en tu script original
    FOREIGN KEY (ID_Direccion) REFERENCES Direccion(ID_Direccion),
    FOREIGN KEY (ID_Huesped) REFERENCES Huesped(ID_Huesped) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. HABITACIONES Y TIPOS

CREATE TABLE IF NOT EXISTS Habitacion (
    ID_Habitacion INT AUTO_INCREMENT PRIMARY KEY,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('LIBRE','RESERVADA','OCUPADA','FUERA_DE_SERVICIO')),
    cantidad INT NOT NULL,
    costo DECIMAL(10, 2) NOT NULL,
    capacidad INT NOT NULL,
    porcentaje_descuento DECIMAL(5, 2) NOT NULL,
    ID_Categoria INT,
    ID_TipoHabitacion INT NOT NULL,
    FOREIGN KEY (ID_Categoria) REFERENCES Categoria(ID_Categoria),
    FOREIGN KEY (ID_TipoHabitacion) REFERENCES Tipo_Habitacion(ID_TipoHabitacion)
);

CREATE TABLE IF NOT EXISTS Suite (
    ID_Suite INT AUTO_INCREMENT PRIMARY KEY,
    Cantidad_camas_kingsize INT NOT NULL,
    Cantidad_camas_dobles INT NOT NULL,
    ID_Habitacion INT NOT NULL,
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitacion(ID_Habitacion)
);

CREATE TABLE IF NOT EXISTS Individual_Estandar (
    ID_Individual_Estandar INT AUTO_INCREMENT PRIMARY KEY,
    ID_Habitacion INT NOT NULL,
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitacion(ID_Habitacion)
);

CREATE TABLE IF NOT EXISTS Superior_Family_Plan (
    ID_Superior INT AUTO_INCREMENT PRIMARY KEY,
    Cantidad_camas_individuales INT NOT NULL,
    Cantidad_camas_dobles INT NOT NULL,
    ID_Habitacion INT NOT NULL,
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitacion(ID_Habitacion)
);

CREATE TABLE IF NOT EXISTS Doble_Estandar (
    ID_Doble_Estandar INT AUTO_INCREMENT PRIMARY KEY,
    Cantidad_camas_individuales INT NOT NULL,
    Cantidad_camas_dobles INT NOT NULL,
    ID_Habitacion INT NOT NULL,
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitacion(ID_Habitacion)
);

CREATE TABLE IF NOT EXISTS Doble_Superior (
    ID_Doble_Superior INT AUTO_INCREMENT PRIMARY KEY,
    Cantidad_camas_individuales INT NOT NULL,
    Cantidad_camas_dobles INT NOT NULL,
    Cantidad_camas_kingsize INT NOT NULL,
    ID_Habitacion INT NOT NULL,
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitacion(ID_Habitacion)
);

-- 6. RESERVAS Y ESTADIA

CREATE TABLE IF NOT EXISTS Reserva (
    ID_Reserva INT AUTO_INCREMENT PRIMARY KEY,
    estado_reserva VARCHAR(20) NOT NULL CHECK (estado_reserva IN ('PENDIENTE', 'CONFIRMADA', 'CANCELADA')),
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    ID_Huesped INT NOT NULL,
    FOREIGN KEY (ID_Huesped) REFERENCES Huesped(ID_Huesped) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Reserva_Habitacion (
    ID_Reserva INT NOT NULL,
    ID_Habitacion INT NOT NULL,
    PRIMARY KEY (ID_Reserva, ID_Habitacion),
    FOREIGN KEY (ID_Reserva) REFERENCES Reserva(ID_Reserva) ON DELETE CASCADE,
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitacion(ID_Habitacion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Estadia (
    ID_Estadia INT AUTO_INCREMENT PRIMARY KEY,
    check_in DATETIME NOT NULL,
    check_out DATETIME NULL,
    cantidad_dias INT NOT NULL,
    cantidad_huespedes INT NOT NULL,
    cantidad_habitaciones INT NOT NULL,
    ID_Reserva INT NOT NULL UNIQUE,
    ID_Habitacion INT NOT NULL, -- Ojo: Una estadia puede tener muchas habitaciones, quizás esto debería ir aparte
    FOREIGN KEY (ID_Reserva) REFERENCES Reserva(ID_Reserva),
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitacion(ID_Habitacion)
);

CREATE TABLE IF NOT EXISTS Consumo (
    ID_Consumo INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(100) NULL,
    monto DECIMAL(10, 2) NOT NULL,
    ID_Estadia INT NOT NULL,
    FOREIGN KEY (ID_Estadia) REFERENCES Estadia(ID_Estadia)
);

-- 7. FACTURACION (Aqui se rompe el ciclo Factura <-> NotaCredito creando NotaCredito despues)

CREATE TABLE IF NOT EXISTS Factura (
    ID_Factura INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(2) NOT NULL CHECK (tipo IN ('A', 'B')),
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('PENDIENTE', 'PAGADA', 'ANULADA')),
    ID_Estadia INT NOT NULL,
    ID_Responsable INT NOT NULL,
    FOREIGN KEY (ID_Estadia) REFERENCES Estadia(ID_Estadia),
    FOREIGN KEY (ID_Responsable) REFERENCES Responsable_de_pago(ID_Responsable)
);

CREATE TABLE IF NOT EXISTS Nota_Credito (
    ID_NotaCredito INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    ID_Factura INT NOT NULL, 
    FOREIGN KEY (ID_Factura) REFERENCES Factura(ID_Factura)
);

CREATE TABLE IF NOT EXISTS Pago (
    ID_Pago INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(12, 2) NOT NULL,
    ID_Factura INT NOT NULL,
    FOREIGN KEY (ID_Factura) REFERENCES Factura(ID_Factura)
);

-- 8. MEDIOS DE PAGO

CREATE TABLE IF NOT EXISTS Tarjeta_de_Credito (
    Numero_tarjeta_Credito VARCHAR(20) PRIMARY KEY,
    saldo DECIMAL(10,2) NOT NULL,
    codigo_seguridad VARCHAR(10) NULL,
    fecha_vencimiento VARCHAR(10) NOT NULL,
    nombre_titular VARCHAR(255) NOT NULL,
    emisor VARCHAR(100) NULL,
    limite_credito DECIMAL(10, 2) NULL
);

CREATE TABLE IF NOT EXISTS Tarjeta_de_debito (
    Numero_tarjeta_Debito VARCHAR(20) PRIMARY KEY,
    saldo DECIMAL(10,2) NOT NULL,
    codigo_seguridad VARCHAR(10) NULL,
    fecha_vencimiento VARCHAR(10) NOT NULL,
    nombre_titular VARCHAR(255) NOT NULL,
    banco_asociado VARCHAR(100) NULL,
    tipo VARCHAR(20),
    numero_cuenta VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Cheque_Propio (
    Numero_cheque_propio VARCHAR(50) PRIMARY KEY,
    fecha DATE NOT NULL,
    banco VARCHAR(100) NOT NULL,
    beneficiario VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Cheque_tercero (
    Numero_cheque_tercero VARCHAR(50) PRIMARY KEY,
    fecha DATE NOT NULL,
    banco VARCHAR(100) NOT NULL,
    beneficiario VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Medio_de_Pago (
    ID_Medio_de_Pago INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(10,2) NOT NULL,
    fecha_de_pago DATETIME,
    ID_Pago INT NOT NULL,
    ID_efectivo INT NULL,
    Numero_tarjeta_Credito VARCHAR(20) NULL,
    Numero_tarjeta_Debito VARCHAR(20) NULL,
    ID_Moneda_Extranjera INT NULL,
    Numero_cheque_tercero VARCHAR(50) NULL,
    Numero_cheque_propio VARCHAR(50) NULL,
    FOREIGN KEY (ID_Pago) REFERENCES Pago(ID_Pago),
    FOREIGN KEY (ID_efectivo) REFERENCES Efectivo(ID_efectivo),
    FOREIGN KEY (Numero_tarjeta_Credito) REFERENCES Tarjeta_de_Credito(Numero_tarjeta_Credito),
    FOREIGN KEY (Numero_tarjeta_Debito) REFERENCES Tarjeta_de_debito(Numero_tarjeta_Debito),
    FOREIGN KEY (ID_Moneda_Extranjera) REFERENCES Moneda_extranjera(ID_Moneda_Extranjera),
    FOREIGN KEY (Numero_cheque_tercero) REFERENCES Cheque_tercero(Numero_cheque_tercero),
    FOREIGN KEY (Numero_cheque_propio) REFERENCES Cheque_propio(Numero_cheque_propio)
);