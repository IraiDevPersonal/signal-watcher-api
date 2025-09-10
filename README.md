# Signal Watcher API

Una API REST para monitoreo y análisis de eventos de seguridad con capacidades de inteligencia artificial y sistema de watchlists. Esta aplicación permite crear listas de vigilancia con términos específicos, detectar eventos relacionados y enriquecerlos automáticamente con análisis de IA.

## Características Principales

- **Sistema de Watchlists**: Creación y gestión de listas de vigilancia con términos personalizables
- **Detección de Eventos**: Monitoreo automático de eventos basados en los términos de las watchlists
- **Enriquecimiento con IA**: Análisis automático de eventos usando OpenAI para clasificación de severidad y sugerencias
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

La aplicación integra OpenAI GPT-3.5-turbo para el enriquecimiento automático de eventos detectados. La implementación incluye:

**¿Por qué esta implementación?**

- **Análisis Automático**: Cada evento detectado es analizado automáticamente para determinar su severidad (LOW, MED, HIGH, CRITICAL) y generar sugerencias de acción
- **Fallback Robusto**: Si OpenAI no está disponible o falla, el sistema utiliza un mock inteligente basado en patrones de texto

**Funcionamiento**:

```typescript
// Si OpenAI falla o no está configurado, se usa el mock automáticamente
const aiResponse = await enrichEvent(description, correlationId);
```

El mock analiza patrones en el texto del evento para clasificar severidad y generar sugerencias apropiadas, garantizando que la aplicación siempre funcione independientemente de la disponibilidad de servicios externos.

### Sistema de Caché

Se implementó un sistema de caché en memoria con arquitectura de adaptador que facilita futuras migraciones:

**¿Por qué esta implementación?**

- **Rendimiento**: Reduce significativamente las consultas a la base de datos para watchlists y eventos frecuentemente accedidos
- **Flexibilidad**: El diseño permite cambiar fácilmente a Redis u otros sistemas de caché
- **Simplicidad**: Para el alcance actual, el caché en memoria es suficiente y no requiere infraestructura adicional

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
OPENAI_API_KEY
```

## Uso de la API

### Endpoints Principales

**Watchlists**:

- `POST /api/v1/watchlists` - Crear nueva watchlist
- `GET /api/v1/watchlists` - Obtener todas las watchlists
- `GET /api/v1/watchlists/:id` - Obtener watchlist específica

**Events**:

- `POST /api/v1/events` - Crear nuevo evento
- `GET /api/v1/events` - Obtener eventos con filtros

### Ejemplo de Uso

```javascript
// Crear una watchlist
const watchlist = await fetch("${BASE_URL}/api/v1/watchlists", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Seguridad Crítica",
    terms: ["malware", "breach", "ransomware"]
  })
});

// El sistema automáticamente detectará eventos que contengan estos términos
// y los enriquecerá con análisis de IA
```

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, TypeScript
- **Base de Datos**: Prisma ORM
- **IA**: OpenAI GPT-3.5-turbo
- **Logging**: Winston
- **Validación**: Zod
- **Desarrollo**: ESLint, Prettier, ts-node-dev
