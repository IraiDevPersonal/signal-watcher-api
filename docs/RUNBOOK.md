# Runbook - Signal Watcher API

## Información General

**Aplicación**: Signal Watcher API
**Versión**: 1.0.0
**Tecnologías**: Node.js, TypeScript, Express, Prisma, PostgreSQL, Google Gemini AI
**Puerto por defecto**: Configurado via variable de entorno `PORT`

## Configuración del Entorno

### Variables de Entorno Requeridas

```env
PORT=3000
POSTGRES_USER=
POSTGRES_DB=
POSTGRES_PASSWORD=
POSTGRES_URL=
LOG_LEVEL=info
GEMINI_API_KEY=
```

### Dependencias del Sistema

- **Node.js**: v18 o superior
- **npm/pnpm**: Para gestión de paquetes
- **Docker**: Para base de datos PostgreSQL (recomendado)
- **PostgreSQL**: v13 o superior (si no usa Docker)

## Instalación y Despliegue

### 1. Instalación Inicial

```bash
# Clonar repositorio
git clone git@github.com:IraiDevPersonal/signal-watcher-api.git
cd signal-watcher-api

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con valores apropiados
```

### 2. Configuración de Base de Datos

#### Opción A: Con Docker (Recomendado)

```bash
# Iniciar PostgreSQL con Docker Compose
docker-compose up -d postgres

# Verificar que el contenedor esté corriendo
docker ps -f name=signal-watcher-postgres-db
```

#### Opción B: PostgreSQL Local (No usa ni recomendada)

```bash
# Instalar PostgreSQL localmente
# Crear base de datos y usuario según variables de entorno
```

### 3. Configuración de Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npx prisma db push

# Verificar conexión (opcional)
npx prisma studio
```

### 4. Inicio de la Aplicación

#### Desarrollo

```bash
pnpm dev
```

#### Producción

```bash
# Compilar aplicación
pnpm build

# Iniciar aplicación compilada
pnpm start
```

## Operaciones de Rutina

### Monitoreo de Salud

#### Verificar Estado de la Aplicación

```bash
# Verificar que la aplicación responda
curl http://localhost:3000/health
```

#### Verificar Base de Datos

```bash
# Conectar a PostgreSQL
docker exec -it signal-watcher-postgres-db psql -U {USUARIO_BASE_DE_DATOS_EN_EL_ENV} -d {NOMBRE_BASE_DE_DATOS_EN_EL_ENV}

# Verificar tablas principales
\dt

# Verificar cantidad de registros
SELECT COUNT(*) FROM "WatchList";
SELECT COUNT(*) FROM "Event";
```

### Gestión de Logs

#### Ubicación de Logs

- **Desarrollo**: Consola
- **Producción**: Archivos de log en directorio de Railway

#### Niveles de Log

- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `debug`: Información detallada para debugging

## Resolución de Problemas

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos

**Síntomas**:

```
Error: Can't reach database server at localhost:5432
```

**Solución**:

```bash
# Verificar que PostgreSQL esté corriendo
docker ps -f name=signal-watcher-postgres-db

# Si no está corriendo, iniciar
docker-compose up -d

# Verificar variables de entorno
echo $POSTGRES_URL
```

#### 2. Error de Gemini AI API

**Síntomas**:

```
Error: No se obtuvo respuesta de la IA
```

**Solución**:

```bash
# Verificar API key
echo $GEMINI_API_KEY
```

#### 3. Puerto en Uso

**Síntomas**:

```
Error: listen EADDRINUSE :::3000
```

**Solución**:

```bash
# Encontrar proceso usando el puerto
# En Windows:

# En Windows:
netstat -ano | findstr :3000

# En macOS:
lsof -i :3000

# Terminar proceso
# En Windows:
taskkill /F /PID <PID>

# En macOS:
kill -9 <PID>

# O cambiar puerto en .env
PORT=3001
# o usar otro puerto disponible
```

#### Analizar Correlation IDs

```bash
# Extraer correlation ID de error
# Buscar todas las operaciones relacionadas
```

### Migraciones de Base de Datos

```bash
# Crear nueva migración
npx prisma migrate dev --name descripcion_cambio

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (SOLO DESARROLLO)
npx prisma migrate reset
```
