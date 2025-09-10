import { AIResponse } from "@/types/ai";

export type EventModel = AIResponse & {
  id: string;
  type: string;
  description: string;
  watchListId: string;
};
