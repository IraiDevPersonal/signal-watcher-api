import OpenAI from "openai";
import { Severity } from "@prisma/client";
import { CustomError } from "./custom-error";
import { logger } from "./logger";
import { ENVS } from "./configs";
import { AIResponse } from "@/types/ai";

const client = new OpenAI({
  apiKey: ENVS.OPENAI_API_KEY
});

export async function enrichEvent(description: string, correlationId: string): Promise<AIResponse> {
  try {
    const prompt = `
You are a security assistant. Analyze the following event description:

"${description}"

1. Summarize it in natural language.
2. Classify severity as one of: LOW, MED, HIGH, CRITICAL.
3. Suggest the next action for an analyst.
Answer in JSON with keys: aiSummary, severity, aiSuggestion.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const raw = response.choices[0].message.content;
    if (!raw) {
      logger.error("No se obtuvo respuesta de la IA", { correlationId });
      throw CustomError.internalServer("No se obtuvo respuesta de la IA");
    }

    const parsed = JSON.parse(raw);

    return {
      severity: (parsed.severity as Severity) || "LOW",
      aiSuggestion: parsed.aiSuggestion || "Monitor de actividad",
      aiSummary: parsed.aiSummary || `Evento detectado: ${description}`
    };
  } catch (error) {
    logger.error("Error al obtener respuesta de la IA, retornando evento mock IA", { correlationId, error });
    return mockEnrichEvent(description);
  }
}

function mockEnrichEvent(description: string): AIResponse {
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
