import { aiClient } from "@/lib/ai";
import { logger } from "@/lib/logger";
import { Severity } from "@prisma/client";
import { EventModel } from "../models/event";
import { CustomError } from "@/lib/custom-error";

type AiResponse = Pick<EventModel, "aiSummary" | "severity" | "aiSuggestion">;

export async function enrichEvent(
  description: string,
  terms: string[],
  correlationId: string
): Promise<AiResponse> {
  try {
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

    const response = (await aiClient({
      prompt,
      correlationId,
      systemInstruction: "You are a security assistant."
    })) as AiResponse;

    if (!("severity" in response) || !("aiSuggestion" in response) || !("aiSummary" in response)) {
      throw CustomError.internalServer("Formato de respuesta de la IA inválido");
    }

    return response;
  } catch (error) {
    logger.error("Error al obtener respuesta de la IA, retornando mock IA", { correlationId, error });
    return mockEnrichEvent(description);
  }
}

function mockEnrichEvent(description: string): AiResponse {
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
