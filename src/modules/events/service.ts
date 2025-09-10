import { enrichEvent } from "@/lib/ai";
import { Event, PrismaClient } from "@prisma/client";
import { CreateEventPayload } from "./models/create-event-payload";
import { EventModel } from "./models/event";
import { logger } from "@/lib/logger";
import { CustomError } from "@/lib/custom-error";
import { WatchListService } from "../watchlist/service";
import { EventFilters } from "./models/filters";
import { memoryCache } from "@/lib/cache";

export class EventService {
  private readonly bd: PrismaClient;
  private readonly queryCacheKey = "event";
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
      const ai = await enrichEvent(payload.description, correlationId);
      logger.info("Evento enriquecido con IA", { correlationId, ai });

      logger.info("Buscando watchlist", { correlationId, watchListId: payload.watchListId });
      const existingWatchList = await this.watchListService.getWatchListById(
        payload.watchListId,
        correlationId
      );

      if (!existingWatchList) {
        logger.info("Watchlist no encontrada", { correlationId, watchListId: payload.watchListId });
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

      const eventModel = this.mapEventToModel(event);
      const logInfo = { correlationId, eventId: eventModel.id };

      logger.info("Evento creado", logInfo);

      memoryCache.delByPrefix(this.queryCacheKey);
      logger.info("Cache de eventos limpiado", { correlationId });

      memoryCache.set(memoryCache.buildCacheKey(this.queryCacheKey, [eventModel.id]), eventModel);
      logger.info("Evento guardado en cache", logInfo);

      return eventModel;
    } catch (error) {
      logger.error("Error al crear evento", {
        correlationId,
        error: CustomError.getErrorData(error).message
      });
      throw CustomError.bdError(error);
    }
  };

  getAllEvents = async (filters: EventFilters, correlationId: string): Promise<EventModel[]> => {
    try {
      const cacheKey = memoryCache.buildCacheKey(
        this.queryCacheKey,
        [filters.watchListId ? filters.watchListId : ""],
        "list"
      );
      const cachedEvents = memoryCache.get<EventModel[]>(cacheKey);

      if (cachedEvents) {
        logger.info("Se obtuvieron eventos del cache", { correlationId, cacheKey });
        return cachedEvents;
      }

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

      const events = result.map(this.mapEventToModel);

      memoryCache.set(cacheKey, events);
      logger.info("Cache de eventos actualizado", { correlationId });

      return events;
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
