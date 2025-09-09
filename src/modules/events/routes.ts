import { Router } from "express";
import { EventService } from "./service";
import { EventController } from "./controller";
import { validateSchema } from "@/lib/middlewares/validate-schema";
import { CreateEventSchema } from "./models/create-event-payload";

export class EventRoutes {
  private static readonly service = new EventService();
  private static readonly controller = new EventController(this.service);

  static get routes(): Router {
    const router = Router();

    router.get("/", this.controller.getAllEvents);
    router.post("/", validateSchema(CreateEventSchema), this.controller.simulateEvent);

    return router;
  }
}
