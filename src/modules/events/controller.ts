import { Request, Response } from "express";
import { EventService } from "./service";
import { logger } from "@/lib/logger";
import { CustomError } from "@/lib/custom-error";
import { ApiResponse } from "@/types/shared";
import { EventFilters } from "./models/filters";
import { EventModel } from "./models/event";

export class EventController {
  private readonly service: EventService;

  constructor(service: EventService) {
    this.service = service;
  }

  simulateEvent = async (req: Request, res: Response) => {
    try {
      const correlationId = req.correlationId;
      logger.info("Simulación de evento recibida", { correlationId, body: req.body });

      const event = await this.service.createEvent(req.body, correlationId);

      const response: ApiResponse<EventModel> = {
        success: true,
        data: event,
        correlationId
      };

      logger.info("Simulación de evento exitosa", { correlationId, eventId: event.id });

      res.status(201).json(response);
    } catch (error) {
      return CustomError.handleError(error, res);
    }
  };

  getAllEvents = async (req: Request, res: Response) => {
    try {
      const correlationId = req.correlationId;

      const filters = this.buildFilters(req.query);

      const logMessage = filters.watchListId
        ? `Se recibió la solicitud de obtener eventos para watchlistId: ${filters.watchListId}`
        : "Se recibió la solicitud de obtener todos los eventos";

      logger.info(logMessage, { correlationId, filters });

      const events = await this.service.getAllEvents(filters, correlationId);
      const response: ApiResponse<EventModel[]> = {
        success: true,
        data: events,
        correlationId
      };

      res.json(response);
    } catch (error) {
      return CustomError.handleError(error, res);
    }
  };

  buildFilters = (query: Request["query"]): EventFilters => {
    const filters: EventFilters = {
      watchListId: undefined
    };

    if (query.watchlistId) {
      filters.watchListId = query.watchlistId.toString();
    }

    return filters;
  };
}
