# Signal Watcher API

Una API REST para monitoreo y análisis de eventos de seguridad con capacidades de inteligencia artificial y sistema de watchlists. Esta aplicación permite crear listas de vigilancia con términos específicos, detectar eventos relacionados y enriquecerlos automáticamente con análisis de IA.

## Características Principales

- **Sistema de Watchlists**: Creación y gestión de listas de vigilancia con términos personalizables
- **Detección de Eventos**: Monitoreo automático de eventos basados en los términos de las watchlists
- **Enriquecimiento con IA**: Análisis automático de eventos usando Google Gemini AI para clasificación de severidad y sugerencias
- **Sistema de Caché**: Implementación de caché en memoria con posibilidad de migrar a Redis
- **Trazabilidad**: Sistema de correlationId para seguimiento de requests a través de toda la aplicación
- **Logging Estructurado**: Sistema de logs completo con Winston para monitoreo y debugging

## Arquitectura del Proyecto

```
src/
├── lib/                    # Utilidades y servicios base
│   ├── middlewares/        # Middlewares de Express
│   ├── ai.ts              # Servicio de IA con OpenAI
│   ├── cache.ts           # Sistema de caché en memoria
│   ├── custom-error.ts    # Manejo centralizado de errores
│   └── logger.ts          # Configuración de logging
├── modules/               # Módulos de negocio
│   ├── events/           # Gestión de eventos
│   └── watchlist/        # Gestión de watchlists
├── types/                # Definiciones de tipos TypeScript
└── index.ts              # Punto de entrada de la aplicación
```

## Implementaciones Técnicas

### Sistema de Inteligencia Artificial

La aplicación integra Google Gemini AI (gemini-2.5-flash) para el enriquecimiento automático de eventos detectados. La implementación incluye:

**¿Por qué esta implementación?**

- **Análisis Automático**: Cada evento detectado es analizado automáticamente para determinar su severidad (LOW, MED, HIGH, CRITICAL) y generar sugerencias de acción
- **Respuesta Estructurada**: Gemini AI está configurado para devolver respuestas en formato JSON, facilitando el procesamiento
- **Modelo Avanzado**: Gemini 2.5 Flash ofrece excelente rendimiento y capacidades de análisis contextual

**Funcionamiento**:

```typescript
// Análisis automático con Gemini AI
const aiResponse = await aiClient({
  prompt: description,
  correlationId,
  systemInstruction: "Analiza el evento y clasifica su severidad"
});
```

El sistema utiliza instrucciones del sistema personalizadas para guiar el análisis y garantizar respuestas consistentes y útiles.

En caso de fallar, se usara un fallback (mock IA).

### Sistema de Caché

Se implementó un sistema de caché en memoria con arquitectura de adaptador que facilita futuras migraciones:

**¿Por qué esta implementación?**

- **Rendimiento**: Reduce significativamente las consultas a la base de datos para watchlists y eventos frecuentemente accedidos
- **Flexibilidad**: El diseño permite cambiar fácilmente a Redis u otros sistemas de caché
- **Simplicidad**: Para el alcance actual, el caché en memoria es suficiente y no requiere infraestructura adicional

**¿Por qué esta no se uso Redis?**

- **Costo**: No manejo de manera la api de Redis y no tengo conocimiento suficiente como para implementarla.
- **Flexibilidad**: El diseño permite cambiar fácilmente a Redis u otros sistemas de caché

**Características**:

- TTL configurable por entrada
- Limpieza automática de entradas expiradas
- Invalidación por prefijos para actualizaciones eficientes
- Construcción inteligente de claves de caché

**Migración a Redis**:
El adaptador está diseñado para facilitar la implementación de Redis cuando sea necesario. Solo requiere implementar la misma interfaz en una nueva clase `RedisCache` sin cambiar el código de negocio.

### Sistema de Trazabilidad (CorrelationId)

Cada request recibe un `correlationId` único que se propaga a través de toda la aplicación:

**Beneficios**:

- **Debugging**: Facilita el seguimiento de requests específicos en los logs
- **Monitoreo**: Permite correlacionar eventos y errores con requests específicos
- **Auditoría**: Proporciona trazabilidad completa de las operaciones

**Implementación**:

- Middleware que genera o extrae el correlationId del header `x-correlation-id`
- Propagación automática a través de servicios, logs y respuestas
- Inclusión en todas las respuestas de error para facilitar el soporte

## Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- npm o pnpm
- opcional: docker para la base de datos Postgres (recomendado, es lo que se uso en desarrollo)

### Instalación

1. Clona el repositorio:

```bash
git clone git@github.com:IraiDevPersonal/signal-watcher-api.git
cd signal-watcher-api
```

2. Instala las dependencias:

```bash
pnpm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
# Edita el archivo .env con tus configuraciones
```

4. Configura la base de datos:

```bash
npx prisma generate
npx prisma db push
```

5. Inicia el servidor:

```bash
pnpm dev
```

## Variables de Entorno

```env
PORT
POSTGRES_USER
POSTGRES_DB
POSTGRES_PASSWORD
POSTGRES_URL
LOG_LEVEL
GEMINI_API_KEY
```

## Uso de la API

### Health Check

#### Verificar Estado de la Aplicación
**GET** `/health`

Verifica que la aplicación esté funcionando correctamente.

**Response (200):**

```json
{
  "status": "healthy",
  "service": "Signal Watcher API",
  "version": "1.0.0",
  "timestamp": "2024-09-10T21:48:19.000Z"
}
```

### Endpoints de Watchlists

#### 1. Crear Watchlist

**POST** `/api/v1/watchlists`

Crea una nueva lista de vigilancia con términos específicos.

**Request:**

```json
{
  "name": "Seguridad Crítica",
  "terms": ["malware", "breach", "ransomware", "phishing"]
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "clm123abc456def789",
    "name": "Seguridad Crítica",
    "terms": ["malware", "breach", "ransomware", "phishing"],
    "createdAt": "2024-09-10T21:00:00.000Z",
    "updatedAt": "2024-09-10T21:00:00.000Z"
  },
  "correlationId": "req-abc123-def456"
}
```

#### 2. Obtener Todas las Watchlists

**GET** `/api/v1/watchlists`

Obtiene todas las listas de vigilancia existentes.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clm123abc456def789",
      "name": "Seguridad Crítica",
      "terms": ["malware", "breach", "ransomware", "phishing"],
      "createdAt": "2024-09-10T21:00:00.000Z",
      "updatedAt": "2024-09-10T21:00:00.000Z"
    },
    {
      "id": "clm789xyz123abc456",
      "name": "Monitoreo Red",
      "terms": ["ddos", "intrusion", "firewall"],
      "createdAt": "2024-09-10T20:30:00.000Z",
      "updatedAt": "2024-09-10T20:30:00.000Z"
    }
  ],
  "correlationId": "req-xyz789-abc123"
}
```

#### 3. Obtener Watchlist por ID

**GET** `/api/v1/watchlists/:id`

Obtiene una lista de vigilancia específica por su ID.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "clm123abc456def789",
    "name": "Seguridad Crítica",
    "terms": ["malware", "breach", "ransomware", "phishing"],
    "createdAt": "2024-09-10T21:00:00.000Z",
    "updatedAt": "2024-09-10T21:00:00.000Z"
  },
  "correlationId": "req-def456-ghi789"
}
```

### Endpoints de Events

#### 1. Crear/Simular Evento

**POST** `/api/v1/events`

Crea un nuevo evento que será analizado automáticamente por el sistema de IA.

**Request:**

```json
{
  "type": "security_alert",
  "description": "Se detectó actividad sospechosa de malware en el servidor principal",
  "watchListId": "clm123abc456def789"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "clm456def789ghi012",
    "type": "security_alert",
    "description": "Se detectó actividad sospechosa de malware en el servidor principal",
    "severity": "HIGH",
    "aiSummary": "Evento de seguridad crítico: Detección de malware activo",
    "aiSuggestion": "Aislar inmediatamente el servidor afectado y ejecutar análisis completo de malware",
    "watchListId": "clm123abc456def789",
    "createdAt": "2024-09-10T21:15:00.000Z"
  },
  "correlationId": "req-ghi012-jkl345"
}
```

#### 2. Obtener Todos los Eventos

**GET** `/api/v1/events`

Obtiene todos los eventos del sistema.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clm456def789ghi012",
      "type": "security_alert",
      "description": "Se detectó actividad sospechosa de malware en el servidor principal",
      "severity": "HIGH",
      "aiSummary": "Evento de seguridad crítico: Detección de malware activo",
      "aiSuggestion": "Aislar inmediatamente el servidor afectado y ejecutar análisis completo de malware",
      "watchListId": "clm123abc456def789",
      "createdAt": "2024-09-10T21:15:00.000Z"
    },
    {
      "id": "clm789ghi012jkl345",
      "type": "network_alert",
      "description": "Intento de intrusión detectado en firewall perimetral",
      "severity": "MED",
      "aiSummary": "Actividad de red sospechosa bloqueada por firewall",
      "aiSuggestion": "Revisar logs del firewall y actualizar reglas de seguridad",
      "watchListId": "clm789xyz123abc456",
      "createdAt": "2024-09-10T21:10:00.000Z"
    }
  ],
  "correlationId": "req-jkl345-mno678"
}
```

#### 3. Filtrar Eventos por Watchlist

**GET** `/api/v1/events?watchlistId=clm123abc456def789`

Obtiene eventos filtrados por una watchlist específica.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clm456def789ghi012",
      "type": "security_alert",
      "description": "Se detectó actividad sospechosa de malware en el servidor principal",
      "severity": "HIGH",
      "aiSummary": "Evento de seguridad crítico: Detección de malware activo",
      "aiSuggestion": "Aislar inmediatamente el servidor afectado y ejecutar análisis completo de malware",
      "watchListId": "clm123abc456def789",
      "createdAt": "2024-09-10T21:15:00.000Z"
    }
  ],
  "correlationId": "req-mno678-pqr901"
}
```

### Respuestas de Error

Todos los endpoints pueden devolver errores con el siguiente formato:

**Error 400 - Bad Request:**

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "El campo 'name' es requerido",
  "correlationId": "req-error-123"
}
```

**Error 404 - Not Found:**

```json
{
  "success": false,
  "error": "Not Found",
  "message": "No se encontró la watchlist",
  "correlationId": "req-error-456"
}
```

**Error 500 - Internal Server Error:**

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Error interno del servidor",
  "correlationId": "req-error-789"
}
```

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **IA**: Google Gemini AI (gemini-2.5-flash)
- **Logging**: Winston
- **Validación**: Zod
- **Seguridad**: Helmet, CORS
- **Desarrollo**: ESLint, Prettier, ts-node-dev
