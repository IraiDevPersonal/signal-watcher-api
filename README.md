# Airline REST API

Esta es una API REST para generar el check-in de pasajeros en un vuelvo. La API esta construida con Node.js (v22.14.0), Express y TypeScript. Utiliza Prisma como ORM para interactuar con una base de datos MySQL.

## Cómo empezar

Instrucciones para obtener una copia del proyecto y ejecutarlo en tu máquina localmente para desarrollo y pruebas.

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v22.14.0 o mayor)
- [npm](https://www.npmjs.com/) o [pnpm](https://pnpm.io) (o gestor cualquier otro gestor de paquetes compatible)
- [Docker](https://www.docker.com/) (opcional pero es la forma que se utilizo en el desarrollo)

### Instalación

1.  Clona el repositorio
    ```sh
    git clone git@github.com:IraiDevPersonal/airline-rest-api.git
    ```
2.  Instala los paquetes
    ```sh
    npm install
    o
    pnpm install
    ```
3.  Crea un archivo `.env` en el directorio raíz y agrega las siguientes variables de entorno:
    (Se encuentra un archivo `.env.example` que sirve como guia)
    ```
    PORT:
    MYSQL_DATABASE:
    MYSQL_USER:
    MYSQL_PASSWORD:
    MYSQL_ROOT_PASSWORD:
    DATABASE_URL:
    ```
4.  Generar cliente de prisma (se recomienda usar docker para levantar la BD en desarrollo, mas abajo se detalla lo necesario con respecto a docker)
    ```sh
    npx prisma generate
    ```
5.  Inicia el servidor
    ```sh
    npm run dev
    o
    pnpm dev
    ```

## Ejecutar con Docker (Para desarrollo)

1.  Tener Docker y Docker Compose instalados.
2.  Necesitas la imagen de MySQL
3.  Construye y ejecuta los contenedores
    ```sh
    docker-compose up -d
    ```
4.  Ejecutar los comandos de migracion y generacion de esquemas de prisma (si no lo ejecutaste antes)
    ```sh
    npx prisma generate
    ```

## Endpoints de la API

Los siguientes son los endpoints de la API disponibles:

### Vuelos

- **GET** `/flights/:id/passengers`
  - Descripción: Obtiene los pasajeros de un vuelo específico y se les asigna un asiento (check-in).
  - Parámetros:
    - `id`: El ID del vuelo (debe ser un numero entero positivo).
  - Ejemplo de respuesta:
    ```json
    {
      "flightId": 1,
      "takeoffDateTime": 1688207580,
      "takeoffAirport": "Aeropuerto Internacional Arturo Merino Benitez, Chile",
      "landingDateTime": 1688221980,
      "landingAirport": "Aeropuerto Internacional Jorge Cháve, Perú",
      "airplaneId": 1,
      "passengers": [
        {
          "passengerId": 98,
          "dni": "172426876",
          "name": "Abril",
          "age": 28,
          "country": "Chile",
          "boardingPassId": 496,
          "purchaseId": 3,
          "seatTypeId": 3,
          "seatId": 15
        }
      ]
    }
    ```

## Tecnologías Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [MySQL](https://www.mysql.com/)
- [Docker](https://www.docker.com/)
- [Zod](https://zod.dev/)
