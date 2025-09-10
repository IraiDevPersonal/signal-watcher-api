import { Severity } from "@prisma/client";

export type EventModel = {
  id: string;
  type: string;
  aiSummary: string;
  severity: Severity;
  watchListId: string;
  description: string;
  aiSuggestion: string;
};
