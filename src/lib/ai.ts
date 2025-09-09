import { Severity } from "@prisma/client";

export function enrichEvent(description: string) {
  let severity: Severity = "LOW";

  if (/critical|breach|ransom/i.test(description)) severity = "CRITICAL";
  else if (/high|malware|phishing/i.test(description)) severity = "HIGH";
  else if (/suspicious|alert/i.test(description)) severity = "MED";

  const action =
    severity === "CRITICAL"
      ? "Escalar a equipo de respuesta inmediata"
      : severity === "HIGH"
        ? "Abrir ticket y bloquear acceso"
        : severity === "MED"
          ? "Monitorear actividad"
          : "Registrar y continuar monitoreo";

  return {
    aiSummary: `Evento detectado: ${description}`,
    severity,
    aiSuggestion: action
  };
}
