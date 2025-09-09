import { Request, Response } from "express";
import { EventService } from "./service";
import { logger } from "@/lib/logger";
import { CustomError } from "@/lib/custom-error";
import { ApiResponse } from "@/types/shared";

export class EventController {
  private readonly service: EventService;

  constructor(service: EventService) {
    this.service = service;
  }

  simulateEvent = async (req: Request, res: Response) => {
    try {
      const correlationId = req.correlationId;
      logger.info("Simulación de evento recibida", { correlationId, body: req.body });

      const event = await this.service.createEvent(req.body);

      const response: ApiResponse = {
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
      logger.info("Se recibió la solicitud de obtener todas los eventos", { correlationId });

      const events = await this.service.getAllEvents();
      const response: ApiResponse = {
        success: true,
        data: events,
        correlationId
      };

      res.json(response);
    } catch (error) {
      return CustomError.handleError(error, res);
    }
  };
}
