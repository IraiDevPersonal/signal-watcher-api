import { ENVS } from "./lib/config/envs";
import { Routes } from "./routes";
import { Server } from "./server";

(() => {
  const server = new Server({
    port: ENVS.PORT,
    routes: Routes.routes
  });

  server.start();
})();
