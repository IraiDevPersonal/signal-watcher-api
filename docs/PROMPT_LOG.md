# Prompt Log - Signal Watcher API

## Registro de Prompts y Uso de IA

Este documento registra todos los prompts utilizados en el sistema de IA de Signal Watcher API, incluyendo instrucciones del sistema, prompts de usuario y configuraciones específicas para Google Gemini AI.

---

## Configuración General de IA

### Modelo Utilizado

- **Proveedor**: Google Gemini AI
- **Modelo**: `gemini-2.5-flash`
- **Tipo de Respuesta**: `application/json`

### Configuración Base

```typescript
const response = await googleClient.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    systemInstruction,
    responseMimeType: "application/json"
  }
});
```

---

## Prompts del Sistema

### 1. Análisis de Eventos de Seguridad

#### System Instruction (Implementación Actual)

```
You are a security assistant.
```

#### Prompt de Usuario (Implementación Actual)

```typescript
const prompt = `
  Analyze the following event description:

  "${description}"

  Watchlist terms: ${terms.join(", ")}

  1. Summarize it in natural language.
  2. Classify severity as one of: LOW, MED, HIGH, CRITICAL. Take into account the watchlist terms.
  3. Suggest the next action for an analyst.
  Answer in JSON with keys: aiSummary, severity, aiSuggestion.
  4. The aiSummary and aiSuggestion must be in Spanish.
`;
```

#### System Instruction (Versión Extendida - Español)

```
Eres un analista de seguridad cibernética experto. Tu tarea es analizar eventos de seguridad y proporcionar:

1. Clasificación de severidad (LOW, MED, HIGH, CRITICAL)
2. Resumen conciso del evento
3. Sugerencias de acción específicas

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "severity": "LOW|MED|HIGH|CRITICAL",
  "aiSummary": "Resumen breve del evento",
  "aiSuggestion": "Acción recomendada específica"
}

Criterios de severidad:
- LOW: Eventos informativos, sin impacto inmediato
- MED: Eventos que requieren monitoreo, impacto menor
- HIGH: Eventos que requieren acción inmediata, impacto significativo
- CRITICAL: Eventos que requieren respuesta urgente, impacto crítico

Mantén las respuestas concisas pero informativas. Enfócate en acciones prácticas y específicas.
```

#### Ejemplo de Uso (Implementación Actual)

```typescript
const description = "Se detectó actividad sospechosa de malware en el servidor principal";
const terms = ["malware", "breach", "ransomware", "phishing"];
const correlationId = "req-abc123";

const prompt = `
  Analyze the following event description:

  "${description}"

  Watchlist terms: ${terms.join(", ")}

  1. Summarize it in natural language.
  2. Classify severity as one of: LOW, MED, HIGH, CRITICAL. Take into account the watchlist terms.
  3. Suggest the next action for an analyst.
  Answer in JSON with keys: aiSummary, severity, aiSuggestion.
  4. The aiSummary and aiSuggestion must be in Spanish.
`;

const aiResponse = await aiClient({
  prompt,
  correlationId,
  systemInstruction: "You are a security assistant."
});
```

#### Respuesta Esperada

```json
{
  "severity": "HIGH",
  "aiSummary": "Evento de seguridad crítico: Detección de malware activo",
  "aiSuggestion": "Aislar inmediatamente el servidor afectado y ejecutar análisis completo de malware"
}
```

---

## Fallback System (Mock IA)

### Configuración de Fallback

En caso de fallo de la IA, el sistema utiliza un fallback que genera respuestas mock basadas en palabras clave:

```typescript
// Implementación de fallback en caso de error de IA
const mockAiResponse = {
  severity: "MED",
  summary: "Evento procesado sin análisis de IA",
  suggestion: "Revisar manualmente el evento para determinar acciones necesarias"
};
```

---

## Historial de Prompts

### Versión 1.0 (2024-09-09)

- **Cambio**: Implementación inicial del sistema de IA
- **Prompt**: Sistema básico de análisis de eventos
- **Mejoras**: N/A (versión inicial)

### Versión 1.1 (2024-09-10)

- **Cambio**: Refinamiento de criterios de severidad
- **Prompt**: Añadidos criterios específicos para cada nivel de severidad
- **Mejoras**: Mayor precisión en clasificación de eventos

---

## Métricas y Monitoreo

### Indicadores de Rendimiento

- **Tiempo de Respuesta**: Monitoreado a través de logs con correlationId
- **Tasa de Éxito**: Porcentaje de respuestas exitosas vs fallbacks
- **Precisión**: Evaluación manual de clasificaciones de severidad

## Optimizaciones y Mejoras Futuras

### Problemas Comunes

#### 1. Respuesta No JSON

**Síntoma**: Error al parsear respuesta de IA
**Solución**: Verificar system instruction y formato de respuesta

```typescript
if (!response.text) {
  throw CustomError.internalServer("No se obtuvo respuesta de la IA");
}
return JSON.parse(response.text);
```

#### 2. API Key Inválida

**Síntoma**: Error de autenticación con Gemini
**Solución**: Verificar variable de entorno `GEMINI_API_KEY`

#### 3. Rate Limiting

**Síntoma**: Errores 429 de la API de Gemini
**Solución**: Implementar retry logic y backoff exponencial

---
