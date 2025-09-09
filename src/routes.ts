import { Router } from "express";
import { WatchListRoutes } from "./watchlist/routes";

export class Routes {
  static get routes(): Router {
    const router = Router();

    router.use("/api/v1/watchlists", WatchListRoutes.routes);

    return router;
  }
}
