import { Router } from "express";
import { WatchListService } from "./service";
import { WatchListController } from "./controller";
import { validateSchema } from "@/lib/middlewares/validate-schema";
import { CreateWatchListSchema } from "./models/create-watch-list-payload";

export class WatchListRoutes {
  private static readonly service = new WatchListService();
  private static readonly controller = new WatchListController(this.service);

  static get routes(): Router {
    const router = Router();

    router.get("/", this.controller.getAllWatchLists);
    router.get("/:id", this.controller.getWatchListById);
    router.post("/", validateSchema(CreateWatchListSchema), this.controller.createWatchList);

    return router;
  }
}
