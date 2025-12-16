# Hotel Premier 
Este documento contiene las instrucciones necesarias para configurar y ejecutar la aplicación.

# Prerrequisitos
Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- Java Development Kit (JDK): Versión 17 o superior.
- Maven o Gradle: Herramienta de gestión y construcción para el Backend.
- Node.js y npm: Para ejecutar el Frontend.
    * Verificación: 'node -v' y 'npm -v'.
- MySQL Server: La base de datos relacional para el almacenamiento de datos.

---

# 1. Configuración y Ejecución del Backend 
# 1.1. Configuración de la Base de Datos
1.  Asegúrate de que tu servidor MySQL esté activo.
2.  Configuración de Conexión: Navega a la carpeta de configuración del backend '../src/main/resources'.
3.  Edita el archivo 'application.properties' para adaptarlo a tu conexión MySQL local:
    PROPERTIES:
    # Ejemplo de configuración en application.properties
    spring.datasource.url=jdbc:mysql://localhost:3306/nombre_de_tu_db
    spring.datasource.username=tu_usuario_mysql
    spring.datasource.password=tu_contraseña_mysql
    # Configuración adicional para Hibernate/JPA
    spring.jpa.hibernate.ddl-auto=none
    
    # ¡Importante! Reemplaza 'nombre_de_tu_db', 'tu_usuario_mysql' y 'tu_contraseña_mysql' con tus propios datos.

# 1.2. Inicialización de la Base de Datos y Población
1.  Dirígete a la carpeta '../src/main/resources'.
2.  Creación de Tablas: Ejecuta el contenido del archivo 'SCHEMA' directamente en tu cliente MySQL para crear la estructura de tablas.
3.  Población de Datos: Ejecuta el contenido del archivo 'DATA' para insertar los datos iniciales .

# 1.3. Compilación y Ejecución del Backend
1.  Dirígete a la carpeta raíz del backend:
    bash: cd backend
2.  Instalación (Maven): Instala las dependencias y compila:
    bash: mvn clean install
3.  Inicia el servidor Spring Boot:
    bash: mvn spring-boot:run
4.  Dirigirse a la carpeta ../main/java y compilar el archivo llamado "DemoApplication", el cual creará la conexión con la base de datos.

# 2. Configuración y Ejecución del Frontend
# 2.1. Instalación de Dependencias
1.  Navega a la carpeta del frontend:
    bash: cd ../frontend-hotel
2.  Instala las dependencias de Node.js:
    bash: npm install

# 2.2. Ejecución del Frontend
1.  Ejecuta el servidor de desarrollo del frontend:
    bash: npm run dev
    
# 3. Acceso y Uso
1.  Una vez que ambos (Backend y Frontend) estén corriendo. Abrir tu navegador local e ingresar la siguiente URL: http://localhost:3000/login
2. Loguearse con datos de conserjes precargados (ver en el base de datos)

# ¡Ya puedes hacer uso del programa completo!

# ENDPOINTS de ejemplo para cada CU:
Cada vez que se quieran ingresar datos mediante POSTMAN, se debe seleccionar las opciones: "Body", "Raw", y "JSON"

# CU 1 - Autenticar Usuario
http://localhost:8080/api/conserjes/login
{
  "nombre": "admin",
  "contrasena": "admin138"
}

# CU 2 - Buscar Huesped
GET http://localhost:8080/api/huespedes/buscar?apellido=Messi

# CU 5 - Mostrar Estado Habitaciones
GET http://localhost:8080/api/habitaciones/estado?fechaDesde=2025-01-10&fechaHasta=2025-01-15

# CU 4 - Reserva Habitación
POST http://localhost:8080/api/reservas
{
  "nombre": "Juan",
  "apellido": "Perez",
  "telefono": "1123456789",
  "detalles": [
    {
      "idHabitacion": 1,
      "fechaEntrada": "2025-01-10",
      "fechaSalida": "2025-01-15"
    },
    {
      "idHabitacion": 2,
      "fechaEntrada": "2025-01-10",
      "fechaSalida": "2025-01-12"
    }
  ]
}

# CU 6 - Cancelar Reserva
POST http://localhost:8080/api/reservas/cancelar-multiples
[5] o un número de reserva que quieras cancelar

# CU 7 - Facturar
POST http://localhost:8080/api/facturacion/generar
{
  "estadiaId": 1,
  "responsableId": 1,
  "horaSalida": "2025-01-15T10:30",
  "itemsSeleccionados": [
    {
      "descripcion": "Alojamiento (3 noches)",
      "monto": 45000,
      "seleccionado": true
    },
    {
      "descripcion": "Minibar",
      "monto": 3500,
      "seleccionado": true
    },
    {
      "descripcion": "Lavandería",
      "monto": 2000,
      "seleccionado": false
    }
  ]
}


# CU 9 - Dar de Alta Huesped
POST http://localhost:8080/api/huespedes
{
  "nombre": "Lionel",
  "apellido": "Messi",
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "cuit": "20-12345678-3",
  "posicionIVA": "RESPONSABLE_INSCRIPTO",
  "edad": 36,
  "telefono": "1123456789",
  "email": "lionel.messi@gmail.com",
  "fechaNacimiento": "1987-06-24",
  "nacionalidad": "Argentina",
  "ocupacion": "Futbolista",
  "direccion": {
    "calle": "Av. Siempre Viva",
    "numero": "742",
    "ciudad": "Rosario",
    "provincia": "Santa Fe",
    "localidad": "Santa Fe",
    "pais": "Argentina"
  }
}

# CU 10 - Modificar Huesped
PUT http://localhost:8080/api/huespedes
{
  "id": 1,
  "nombre": "Lionel Andrés",
  "apellido": "Messi",
  "tipoDocumento": "PASAPORTE",
  "numeroDocumento": "87654321",
  "cuit": "20-12345678-3",
  "posicionIVA": "RESPONSABLE_INSCRIPTO",
  "edad": 37,
  "telefono": "1199999999",
  "email": "leo.messi@gmail.com",
  "fechaNacimiento": "1987-06-24",
  "nacionalidad": "Argentina",
  "ocupacion": "Jugador profesional",
  "direccion": {
    "id": 1,
    "calle": "Av. Siempre Viva",
    "numero": "742",
    "ciudad": "Rosario",
    "provincia": "Santa Fe",
    "localidad":"Santa Fe",
    "pais": "Argentina"
  }
}

# CU 11 - Dar de Baja Huesped
DELETE http://localhost:8080/api/huespedes/DNI/12345678 (o el número y tipo de documento del huesped que quieras borrar)
