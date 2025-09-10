import { Router } from "express";
import { WatchListService } from "./service";
import { WatchListController } from "./controller";
import { validateSchemaMiddleware } from "@/lib/middlewares/validate-schema.middleware";
import { CreateWatchListSchema } from "./models/create-watch-list-payload";
import { correlationIdMiddleware } from "@/lib/middlewares/correlation-id.middleware";

export class WatchListRoutes {
  private static readonly service = new WatchListService();
  private static readonly controller = new WatchListController(this.service);

  static get routes(): Router {
    const router = Router();

    router.get("/", correlationIdMiddleware, this.controller.getAllWatchLists);
    router.get("/:id", correlationIdMiddleware, this.controller.getWatchListById);
    router.post(
      "/",
      [correlationIdMiddleware, validateSchemaMiddleware(CreateWatchListSchema)],
      this.controller.createWatchList
    );

    return router;
  }
}
