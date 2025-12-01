-- Active: 1763931386304@@localhost@3306@hotel_premier
CREATE DATABASE IF NOT EXISTS hotel_premier;
USE hotel_premier;

-- 1. DIRECCIONES
CREATE TABLE IF NOT EXISTS Direccion (
    ID_Direccion INT AUTO_INCREMENT PRIMARY KEY,
    calle VARCHAR(255) NOT NULL,
    numero INT NOT NULL,
    piso INT,
    departamento VARCHAR(20),
    cod_postal VARCHAR(20) NOT NULL,
    localidad VARCHAR(255) NOT NULL,
    provincia VARCHAR(255) NOT NULL,
    pais VARCHAR(255) NOT NULL
);

-- 2. HABITACIONES
CREATE TABLE IF NOT EXISTS Habitacion (
    ID_Habitacion INT AUTO_INCREMENT PRIMARY KEY,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('LIBRE','RESERVADA','OCUPADA','FUERA_DE_SERVICIO')),
    cantidad INT NOT NULL,
    costo DECIMAL(10, 2) NOT NULL,
    capacidad INT NOT NULL,
    porcentaje_descuento DECIMAL(5, 2) NOT NULL,
    ID_TipoHabitacion INT NOT NULL,
    FOREIGN KEY (ID_TipoHabitacion) REFERENCES TipoHabitacion(ID_TipoHabitacion)
);

CREATE TABLE IF NOT EXISTS TipoHabitacion (
    ID_TipoHabitacion INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(20) NOT NULL,
    cantidad_camas_kingSize INT,
    cantidad_camas_individuales INT,
    cantidad_camas_dobles INT,
    CONSTRAINT chk_tipo_habitacion 
    CHECK (descripcion IN (
        'SUITE',
        'DOBLE ESTANDAR',
        'DOBLE SUPERIOR',
        'INDIVIDUAL ESTANDAR',
        'SUPERIOR FAMILY PLAN'
    ))
);

-- 3. USUARIOS Y CLIENTES
CREATE TABLE IF NOT EXISTS Conserje (
    ID_Conserje INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    contrasena VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS Huesped (
    ID_Huesped INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(25) NOT NULL,
    apellido VARCHAR(25) NOT NULL,
    nro_documento VARCHAR(50) NOT NULL UNIQUE,
    tipo_documento VARCHAR(50) NOT NULL,
    cuit VARCHAR(15) NULL,
    posicion_IVA VARCHAR(30) NOT NULL CHECK (posicion_IVA IN ('CONSUMIDOR_FINAL', 'RESPONSABLE_INSCRIPTO', 'MONOTRIBUTO', 'EXENTO')),
    edad INT,
    telefono VARCHAR(50),
    email VARCHAR(100),
    fecha_nacimiento DATE,
    nacionalidad VARCHAR(50),
    ocupacion VARCHAR(100),
    ID_Direccion INT NOT NULL,
    ID_Estadia INT NULL,
    FOREIGN KEY (ID_Estadia) REFERENCES Estadia(ID_Estadia) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (ID_Direccion) REFERENCES Direccion(ID_Direccion) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 4. RESERVAS Y ESTADIAS
CREATE TABLE IF NOT EXISTS Reserva (
    ID_Reserva INT AUTO_INCREMENT PRIMARY KEY,
    estado_reserva VARCHAR(20) NOT NULL CHECK (estado_reserva IN ('PENDIENTE', 'CONFIRMADA', 'CANCELADA')),
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    nombreHuesped VARCHAR(50) NOT NULL,
    apellidoHuesped VARCHAR(50) NOT NULL,
    telefonoHuesped VARCHAR(50) NOT NULL,
    ID_Habitacion INT NOT NULL,
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitacion(ID_Habitacion)
);

CREATE TABLE IF NOT EXISTS Estadia (
    ID_Estadia INT AUTO_INCREMENT PRIMARY KEY,
    check_in DATETIME NOT NULL,
    check_out DATETIME NULL,
    cantidad_dias INT NOT NULL,
    cantidad_huespedes INT NOT NULL,
    cantidad_habitaciones INT NOT NULL,
    ID_Reserva INT NOT NULL UNIQUE,
    ID_Habitacion INT NOT NULL,
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

-- 5. RESPONSABLES DE PAGO
CREATE TABLE IF NOT EXISTS Responsable_De_Pago (
    ID_Responsable INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(100) -- Agregado para dar contexto
);

CREATE TABLE IF NOT EXISTS Persona_Fisica (
    ID_Persona_Fisica INT AUTO_INCREMENT PRIMARY KEY,
    ID_Responsable INT NOT NULL,
    ID_Huesped INT NOT NULL,
    FOREIGN KEY (ID_Huesped) REFERENCES Huesped(ID_Huesped),
    FOREIGN KEY (ID_Responsable) REFERENCES Responsable_de_pago(ID_Responsable) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Persona_Juridica (
    ID_Persona_Juridica INT AUTO_INCREMENT PRIMARY KEY,
    CUIT_Responsable VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(255) NOT NULL,
    ID_Direccion INT NOT NULL,
    ID_Responsable INT NOT NULL,
    FOREIGN KEY (ID_Direccion) REFERENCES Direccion(ID_Direccion),
    FOREIGN KEY (ID_Persona_Juridica) REFERENCES Responsable_De_Pago(ID_Responsable),
);

-- 6. FACTURACION
CREATE TABLE IF NOT EXISTS Factura (
    ID_Factura INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(2) NOT NULL CHECK (tipo IN ('A', 'B')),
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('PENDIENTE', 'PAGADA', 'ANULADA')),
    ID_Estadia INT NOT NULL,
    ID_Responsable INT NOT NULL,
    ID_NotaCredito INT NULL,
    FOREIGN KEY (ID_NotaCredito) REFERENCES Nota_Credito(ID_NotaCredito),
    FOREIGN KEY (ID_Estadia) REFERENCES Estadia(ID_Estadia),
    FOREIGN KEY (ID_Responsable) REFERENCES Responsable_De_Pago(ID_Responsable)
);

CREATE TABLE IF NOT EXISTS Nota_Credito (
    ID_NotaCredito INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NULL,
    monto DECIMAL(10, 2) NOT NULL,
);

-- 7. PAGOS Y MEDIOS DE PAGO
CREATE TABLE IF NOT EXISTS Pago (
    ID_Pago INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(12, 2) NOT NULL,
    ID_Factura INT NOT NULL,
    FOREIGN KEY (ID_Factura) REFERENCES Factura(ID_Factura)
);
CREATE TABLE IF NOT EXISTS Medio_de_Pago (
    ID_Medio_de_Pago INT AUTO_INCREMENT PRIMARY KEY,
    monto DECIMAL(10,2) NOT NULL,
    fecha_de_pago DATETIME,
    ID_Pago INT NOT NULL,
    FOREIGN KEY (ID_Pago) REFERENCES Pago(ID_Pago)
);

CREATE TABLE IF NOT EXISTS Efectivo (
    ID_Efectivo INT AUTO_INCREMENT PRIMARY KEY,
    ID_Medio_de_Pago INT NOT NULL, 
    FOREIGN KEY (ID_Medio_de_Pago) REFERENCES Medio_de_Pago(ID_Medio_de_Pago)
);

CREATE TABLE IF NOT EXISTS Moneda_Extranjera (
    ID_Moneda_Extranjera INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(20) CHECK (tipo IN ('DOLAR', 'EURO', 'REAL', 'PESO URUGUAYO')) NOT NULL,
    ID_Medio_de_Pago INT NOT NULL, 
    FOREIGN KEY (ID_Medio_de_Pago) REFERENCES Medio_de_Pago(ID_Medio_de_Pago)
);

CREATE TABLE IF NOT EXISTS Tarjeta_De_Credito (
    Numero_tarjeta_Credito VARCHAR(20) PRIMARY KEY,
    saldo DECIMAL(10,2) NOT NULL,
    codigo_seguridad VARCHAR(10) NULL,
    fecha_vencimiento VARCHAR(10) NOT NULL,
    nombre_titular VARCHAR(255) NOT NULL,
    emisor VARCHAR(100) NULL,
    limite_credito DECIMAL(10, 2) NULL,
    ID_Medio_de_Pago INT NOT NULL, 
    FOREIGN KEY (ID_Medio_de_Pago) REFERENCES Medio_de_Pago(ID_Medio_de_Pago)
);
CREATE TABLE IF NOT EXISTS Tarjeta_De_Debito (
    Numero_tarjeta_Debito VARCHAR(20) PRIMARY KEY,
    saldo DECIMAL(10,2) NOT NULL,
    codigo_seguridad VARCHAR(10) NULL,
    fecha_vencimiento VARCHAR(10) NOT NULL,
    nombre_titular VARCHAR(255) NOT NULL,
    banco_asociado VARCHAR(100) NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('VISA', 'MASTERCARD')),
    numero_cuenta VARCHAR(50) NOT NULL,
    ID_Medio_de_Pago INT NOT NULL, 
    FOREIGN KEY (ID_Medio_de_Pago) REFERENCES Medio_de_Pago(ID_Medio_de_Pago)
);

CREATE TABLE IF NOT EXISTS Cheque_Propio (
    Numero_cheque_propio VARCHAR(50) PRIMARY KEY,
    fecha DATE NOT NULL,
    banco VARCHAR(100) NOT NULL,
    beneficiario VARCHAR(255) NOT NULL,
    ID_Medio_de_Pago INT NOT NULL, 
    FOREIGN KEY (ID_Medio_de_Pago) REFERENCES Medio_de_Pago(ID_Medio_de_Pago)
);

CREATE TABLE IF NOT EXISTS Cheque_Tercero (
    Numero_cheque_tercero VARCHAR(50) PRIMARY KEY,
    fecha DATE NOT NULL,
    banco VARCHAR(100) NOT NULL,
    beneficiario VARCHAR(255) NOT NULL,
    ID_Medio_de_Pago INT NOT NULL, 
    FOREIGN KEY (ID_Medio_de_Pago) REFERENCES Medio_de_Pago(ID_Medio_de_Pago)
);
