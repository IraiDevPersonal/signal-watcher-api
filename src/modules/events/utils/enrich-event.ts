import { aiClient } from "@/lib/ai";
import { logger } from "@/lib/logger";
import { Severity } from "@prisma/client";
import { EventModel } from "../models/event";

type Response = Pick<EventModel, "aiSummary" | "severity" | "aiSuggestion">;

export async function enrichEvent(
  description: string,
  terms: string[],
  correlationId: string
): Promise<Response> {
  try {
    const prompt = `
You are a security assistant. Analyze the following event description:

"${description}"

Watchlist terms: ${terms.join(", ")}

1. Summarize it in natural language.
2. Classify severity as one of: LOW, MED, HIGH, CRITICAL. Take into account the watchlist terms.
3. Suggest the next action for an analyst.
Answer in JSON with keys: aiSummary, severity, aiSuggestion.
    `;

    const response = await aiClient(prompt, correlationId);

    return {
      severity: (response.severity as Severity) || "LOW",
      aiSuggestion: response.aiSuggestion || "Monitor de actividad",
      aiSummary: response.aiSummary || `Evento detectado: ${description}`
    };
  } catch (error) {
    logger.error("Error al obtener respuesta de la IA, retornando evento mock IA", { correlationId, error });
    return mockEnrichEvent(description);
  }
}

function mockEnrichEvent(description: string): Response {
  let severity: Severity = "LOW";
  if (/critical|breach|ransom/i.test(description)) severity = "CRITICAL";
  else if (/high|malware|phishing/i.test(description)) severity = "HIGH";
  else if (/suspicious|alert/i.test(description)) severity = "MED";

  const action =
    severity === "CRITICAL"
      ? "Escalar a el equipo de respuesta inmediata"
      : severity === "HIGH"
        ? "Bloquear y abrir ticket de incidente"
        : severity === "MED"
          ? "Monitorizar actividad"
          : "Log y continuar monitoreando";

  return {
    severity,
    aiSuggestion: action,
    aiSummary: `Evento detectado: ${description}`
  };
}
