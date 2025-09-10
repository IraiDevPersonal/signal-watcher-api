import { enrichEvent } from "@/lib/ai";
import { Event, PrismaClient } from "@prisma/client";
import { CreateEventPayload } from "./models/create-event-payload";
import { EventModel } from "./models/event";
import { logger } from "@/lib/logger";
import { CustomError } from "@/lib/custom-error";
import { WatchListService } from "../watchlist/service";
import { EventFilters } from "./models/filters";

export class EventService {
  private readonly bd: PrismaClient;
  private readonly watchListService: WatchListService;

  constructor(watchListService: WatchListService) {
    this.bd = new PrismaClient();
    this.watchListService = watchListService;
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

  createEvent = async (payload: CreateEventPayload, correlationId: string): Promise<EventModel> => {
    try {
      const ai = enrichEvent(payload.description);
      const existingWatchList = await this.watchListService.getWatchListById(
        payload.watchListId,
        correlationId
      );

      if (!existingWatchList) {
        throw CustomError.notFound(`El watchlist: ${payload.watchListId} no se encontro`);
      }

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
    } catch (error) {
      logger.error("Error al crear evento", {
        error: CustomError.getErrorData(error).message
      });
      throw CustomError.bdError(error);
    }
  };

  getAllEvents = async (filters: EventFilters, correlationId: string): Promise<EventModel[]> => {
    try {
      const result = await this.bd.event.findMany({
        where: {
          watchListId: filters.watchListId
        },
        include: { watchList: true },
        orderBy: { createdAt: "desc" }
      });

      const logMessage = filters?.watchListId
        ? `Se obtuvieron eventos para watchlistId: ${filters.watchListId}`
        : "Se obtuvieron todos los eventos";

      logger.info(logMessage, { correlationId, filters });

      return result.map(this.mapEventToModel);
    } catch (error) {
      logger.error("Error al obtener eventos", {
        correlationId,
        filters,
        error: CustomError.getErrorData(error).message
      });
      throw CustomError.bdError(error);
    }
  };
}
