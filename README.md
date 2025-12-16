Instrucciones de Ejecución
Prerrequisitos:
Antes de comenzar, asegurarse de tener instalado lo siguiente en el sistema:
Node.js: Para ejecutar tanto el backend como el frontend.
Verificar la instalación: node -v y npm -v.

MySQL: La aplicación requiere una base de datos MySQL en funcionamiento.
Pasos para la configuración:
1. Configuración y Ejecución del Backend
1.1. Instalación de Dependencias
Navega a la carpeta del backend:
Instala las dependencias del proyecto:
Codigo Bash a insertar en la terminal:
npm install
1.2. Configuración del Entorno (.env)
Crea un archivo llamado .env en la raíz de la carpeta backend.
Define las variables de entorno necesarias para la conexión a tu base de datos MySQL. Esto suele incluir el host, el usuario, la contraseña y el nombre de la base de datos.
En nuestro caso, utilizamos el archivo "application.properties", el cual tienes que modificar para que se adapte a tu conexion MySQL.
1.3 Ejecución del Servidor:
Ahora ya configurada la base de datos y activa la conexión, debes seguir los siguientes pasos:
1- Dentro de la carpeta: /main/resources compilar primero el archivo SCHEMA, el cual crea las tablas de la base de datos.
2- Luego, compilar el archivo DATA para poblar la base de datos.
3- Una vez ya creada y poblada la base de datos, dirigirse a la carpeta /main/java y compilar el archivo llamado "DemoApplication", el cual creará la conexión con la base de datos.
4- Para ejecutar el frontend, seguir los siguientes pasos:
  4.1 Dirigirse a la carpeta frontend-hotel, y abrir una terminal posicionada en esta carpeta
   4.2 ejecutar el siguiente comando bash en la terminal: npm run dev. El servidor API estará en el puerto configurado (por defecto, 3000), accesible generalmente en http://localhost:3000.
5- Abrir tu navegador local e ingresar la siguiente URL: http://localhost:3000/login
6- Loguearse con datos de conserjes precargados (ver en el base de datos)
7- Ya puedes hacer uso del programa completo. 
