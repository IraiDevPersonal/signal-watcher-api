import { Severity } from "@prisma/client";

export type AIResponse = {
  aiSummary: string;
  severity: Severity;
  aiSuggestion: string;
};
