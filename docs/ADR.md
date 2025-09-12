# Architecture Decision Records (ADR)

## Signal Watcher API - Decisiones Arquitectónicas

### ADR-001: Arquitectura Modular con TypeScript y Express

- **Estado**: Aceptado
- **Fecha**: 2024-09-09
- **Contexto**: Necesidad de crear una API REST escalable para monitoreo de eventos de seguridad con capacidades de IA.

#### Decisión

Utilizar Node.js con TypeScript y Express.js organizando el código en una arquitectura modular.

#### Justificación

- **TypeScript**: Proporciona tipado estático, mejor mantenibilidad y detección temprana de errores
- **Express.js**: Framework maduro, amplia comunidad, middleware robusto
- **Arquitectura Modular**: Separación clara de responsabilidades, facilita testing y mantenimiento

#### Consecuencias

- **Positivas**: Código más mantenible, mejor experiencia de desarrollo, escalabilidad
- **Negativas**: Curva de aprendizaje para TypeScript, tiempo adicional de compilación

---

### ADR-002: Prisma ORM con PostgreSQL

- **Estado**: Aceptado
- **Fecha**: 2024-09-09
- **Contexto**: Necesidad de una solución de base de datos robusta para almacenar watchlists y eventos.

#### Decisión

Utilizar Prisma ORM con PostgreSQL como base de datos principal.

#### Justificación

- **Prisma**: Type-safe database client, migraciones automáticas, excelente DX
- **PostgreSQL**: Base de datos relacional robusta, soporte para arrays (términos de watchlist)
- **Escalabilidad**: PostgreSQL maneja bien cargas de trabajo intensivas

#### Consecuencias

- **Positivas**: Queries type-safe, migraciones automáticas, mejor rendimiento
- **Negativas**: Dependencia de PostgreSQL, complejidad adicional en desarrollo local

---

### ADR-003: Sistema de Caché en Memoria con Patrón Adapter

- **Estado**: Aceptado
- **Fecha**: 2024-09-09
- **Contexto**: Necesidad de optimizar rendimiento reduciendo consultas repetitivas a la base de datos.

#### Decisión

Implementar un sistema de caché en memoria con patrón adapter para facilitar futuras migraciones a Redis.

#### Justificación

- **Rendimiento**: Reduce significativamente las consultas a BD para datos frecuentemente accedidos
- **Simplicidad**: Para el alcance actual, caché en memoria es suficiente
- **Flexibilidad**: Patrón adapter permite migrar fácilmente a Redis sin cambios en lógica de negocio
- **TTL Configurable**: Control granular sobre expiración de datos

#### Consecuencias

- **Positivas**: Mejor rendimiento, arquitectura flexible, fácil migración futura
- **Negativas**: Uso adicional de memoria, pérdida de datos en reinicio de aplicación

---

### ADR-004: Integración con Google Gemini AI para Enriquecimiento de Eventos

- **Estado**: Aceptado
- **Fecha**: 2024-09-09 (Actualizado: 2024-09-10)
- **Contexto**: Necesidad de análisis automático de eventos para clasificación de severidad y generación de sugerencias.

#### Decisión

Integrar Google Gemini AI (gemini-2.5-flash) para enriquecimiento automático de eventos.

#### Justificación

- **Análisis Inteligente**: Gemini 2.5 Flash proporciona análisis contextual avanzado de eventos
- **Clasificación Automática**: Determina severidad (LOW, MED, HIGH, CRITICAL) automáticamente
- **Respuesta Estructurada**: Configurado para devolver JSON, facilitando el procesamiento
- **Rendimiento**: Gemini Flash ofrece excelente velocidad de respuesta
- **Costo-Beneficio**: Modelo eficiente con buena relación costo-rendimiento

#### Consecuencias

- **Positivas**: Análisis automático inteligente, respuestas estructuradas, mejor rendimiento
- **Negativas**: Dependencia externa, costos de API, latencia adicional

---

### ADR-005: Sistema de Trazabilidad con Correlation ID

- **Estado**: Aceptado
- **Fecha**: 2024-09-09
- **Contexto**: Necesidad de trazabilidad completa de requests para debugging y monitoreo.

#### Decisión

Implementar sistema de correlation ID que se propaga a través de toda la aplicación.

#### Justificación

- **Debugging**: Facilita seguimiento de requests específicos en logs
- **Monitoreo**: Permite correlacionar eventos y errores con requests específicos
- **Auditoría**: Proporciona trazabilidad completa de operaciones
- **Estándar de Industria**: Práctica común en sistemas distribuidos

#### Consecuencias

- **Positivas**: Mejor observabilidad, debugging más eficiente, trazabilidad completa
- **Negativas**: Overhead mínimo en cada request, complejidad adicional en implementación

---

### ADR-006: Logging Estructurado con Winston

- **Estado**: Aceptado
- **Fecha**: 2024-09-09
- **Contexto**: Necesidad de sistema de logging robusto para monitoreo y debugging en producción.

#### Decisión

Utilizar Winston para logging estructurado con diferentes niveles y formatos.

#### Justificación

- **Flexibilidad**: Múltiples transportes (consola, archivos, servicios externos)
- **Logging Estructurado**: Formato JSON facilita análisis automatizado
- **Niveles Configurables**: Control granular sobre qué se registra
- **Ecosistema Maduro**: Amplia adopción en comunidad Node.js

#### Consecuencias

- **Positivas**: Mejor observabilidad, análisis de logs más eficiente, configuración flexible
- **Negativas**: Overhead de rendimiento mínimo, configuración inicial más compleja

---

### ADR-007: Validación con Zod

- **Estado**: Aceptado
- **Fecha**: 2024-09-09
- **Contexto**: Necesidad de validación robusta de datos de entrada en la API.

#### Decisión

Utilizar Zod para validación de esquemas y transformación de datos.

#### Justificación

- **Type Safety**: Integración perfecta con TypeScript
- **Validación Declarativa**: Esquemas claros y reutilizables
- **Transformación**: Capacidad de transformar datos durante validación
- **Mensajes de Error**: Mensajes descriptivos para debugging

#### Consecuencias

- **Positivas**: Validación robusta, mejor experiencia de desarrollo, menos bugs
- **Negativas**: Dependencia adicional, curva de aprendizaje

---

### ADR-008: Containerización con Docker

**Estado**: Aceptado
**Fecha**: 2024-09-09
**Contexto**: Necesidad de entorno de desarrollo consistente y facilitar despliegue.

#### Decisión

Utilizar Docker Compose para orquestar PostgreSQL en desarrollo.

#### Justificación

- **Consistencia**: Mismo entorno para todos los desarrolladores
- **Simplicidad**: Setup rápido de dependencias
- **Aislamiento**: Evita conflictos con instalaciones locales
- **Portabilidad**: Facilita despliegue en diferentes entornos

#### Consecuencias

- **Positivas**: Entorno consistente, setup simplificado, mejor portabilidad
- **Negativas**: Dependencia de Docker, uso adicional de recursos

---

### ADR-009: Manejo Centralizado de Errores

**Estado**: Aceptado
**Fecha**: 2024-09-09
**Contexto**: Necesidad de manejo consistente de errores a través de toda la aplicación.

#### Decisión

Implementar clase CustomError centralizada para manejo de errores con tipos específicos.

#### Justificación

- **Consistencia**: Formato uniforme de errores en toda la aplicación
- **Trazabilidad**: Incluye correlation ID en respuestas de error
- **Clasificación**: Diferentes tipos de error (validación, BD, servidor, etc.)
- **Debugging**: Información estructurada para facilitar resolución

#### Consecuencias

- **Positivas**: Mejor experiencia de debugging, respuestas consistentes, mantenimiento simplificado
- **Negativas**: Abstracción adicional, posible over-engineering para casos simples

---

### Rate Limiting

**Estado**: Aceptado
**Fecha**: 2024-09-12
**Contexto**: Para proteger la API de abuso y controlar costos de Gemini AI (de aplicarse en caso de plan de pago).
**Decisión**: Implementar middleware de rate limiting personalizado.

#### Justificación

- **Seguridad**: Protege la API de abuso
- **Costos**: Controla costos de Gemini AI (de aplicarse en caso de plan de pago)

#### Consecuencias

- **Positivas**: Mejor seguridad, control de costos
- **Negativas**: Implementación adicional, una dependencia adicional y suma complejidad al proyecto

---

### Migración a Redis

**Estado**: Pendiente
**Contexto**: Cuando la aplicación escale, el caché en memoria puede ser insuficiente.
**Consideraciones**: El patrón adapter actual facilita esta migración sin cambios en lógica de negocio.
