import cors from "cors";
import express, { Router } from "express";
import helmet from "helmet";
import { generalRateLimit } from "./lib/middlewares/rate-limit.middleware";

type Options = {
  port: number;
  routes: Router;
};

export class Server {
  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly routes: Router;

  constructor({ port, routes }: Options) {
    this.routes = routes;
    this.port = port;
  }

  async start() {
    //* Middlewares
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(generalRateLimit);

    //* Routes
    this.app.use(this.routes);

    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server runing on port: ${this.port}`);
    });
  }

  close() {
    this.serverListener?.close();
  }
}
