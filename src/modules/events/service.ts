import { enrichEvent } from "@/lib/ai";
import { Event, PrismaClient } from "@prisma/client";
import { CreateEventPayload } from "./models/create-event-payload";
import { EventModel } from "./models/event";

export class EventService {
  private readonly bd: PrismaClient;

  constructor() {
    this.bd = new PrismaClient();
  }

  private mapEventToModel = (event: Event): EventModel => {
    return {
      id: event.id,
      type: event.type,
      description: event.description,
      severity: event.severity,
      aiSummary: event.aiSummary || "",
      aiSuggestion: event.aiSuggestion || "",
      watchListId: event.watchListId
    };
  };

  createEvent = async (payload: CreateEventPayload): Promise<EventModel> => {
    const ai = enrichEvent(payload.description);

    const event = await this.bd.event.create({
      data: {
        type: payload.type,
        description: payload.description,
        severity: ai.severity,
        aiSummary: ai.aiSummary,
        aiSuggestion: ai.aiSuggestion,
        watchListId: payload.watchListId
      }
    });

    return this.mapEventToModel(event);
  };

  getAllEvents = async (): Promise<EventModel[]> => {
    const result = await this.bd.event.findMany({
      include: { watchList: true },
      orderBy: { createdAt: "desc" }
    });

    return result.map(this.mapEventToModel);
  };
}
