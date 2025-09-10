import { Router } from "express";
import { EventService } from "./service";
import { EventController } from "./controller";
import { validateSchemaMiddleware } from "@/lib/middlewares/validate-schema.middleware";
import { CreateEventSchema } from "./models/create-event-payload";
import { WatchListService } from "../watchlist/service";
import { correlationIdMiddleware } from "@/lib/middlewares/correlation-id.middleware";

export class EventRoutes {
  private static readonly watchListService = new WatchListService();
  private static readonly service = new EventService(this.watchListService);
  private static readonly controller = new EventController(this.service);

  static get routes(): Router {
    const router = Router();

    router.get("/", correlationIdMiddleware, this.controller.getAllEvents);
    router.post(
      "/",
      [correlationIdMiddleware, validateSchemaMiddleware(CreateEventSchema)],
      this.controller.simulateEvent
    );

    return router;
  }
}
