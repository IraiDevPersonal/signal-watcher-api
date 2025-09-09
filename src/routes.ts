import { Router } from "express";
import { WatchListRoutes } from "./modules/watchlist/routes";
import { EventRoutes } from "./modules/events/routes";

export class Routes {
  private static createV1Endpoint(endpoint: string): string {
    return `/api/v1${endpoint}`;
  }

  static get routes(): Router {
    const router = Router();

    router.use(this.createV1Endpoint("/watchlists"), WatchListRoutes.routes);
    router.use(this.createV1Endpoint("/events"), EventRoutes.routes);

    return router;
  }
}
