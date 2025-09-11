import { CustomError } from "@/lib/custom-error";
import { logger } from "@/lib/logger";
import { ApiResponse } from "@/types/shared";
import { Request, Response } from "express";
import { WatchListService } from "./service";
import { WatchListModel } from "./models/watch-list";

export class WatchListController {
  private readonly service: WatchListService;

  constructor(service: WatchListService) {
    this.service = service;
  }

  createWatchList = async (req: Request, res: Response) => {
    try {
      const correlationId = req.correlationId;

      logger.info("Se recibió la solicitud de creación de watchlist", {
        correlationId,
        body: req.body
      });

      const watchList = await this.service.createWatchList(req.body, correlationId);

      const response: ApiResponse<WatchListModel> = {
        success: true,
        data: watchList,
        correlationId
      };

      logger.info("Se creó la watchlist exitosamente", {
        correlationId,
        watchListId: watchList.id
      });

      res.status(201).json(response);
    } catch (error) {
      return CustomError.handleError(error, res);
    }
  };

  getAllWatchLists = async (req: Request, res: Response) => {
    try {
      const correlationId = req.correlationId;

      logger.info("Se recibió la solicitud de obtener todas las watchlists", { correlationId });

      const watchLists = await this.service.getAllWatchLists(correlationId);

      const response: ApiResponse<WatchListModel[]> = {
        success: true,
        data: watchLists,
        correlationId
      };

      res.json(response);
    } catch (error) {
      return CustomError.handleError(error, res);
    }
  };

  getWatchListById = async (req: Request, res: Response) => {
    try {
      const correlationId = req.correlationId;
      const { id } = req.params;

      logger.info("Se recibió la solicitud de obtener la watchlist por ID", {
        correlationId,
        watchListId: id
      });

      const watchList = await this.service.getWatchListById(id, correlationId);

      if (!watchList) {
        throw CustomError.notFound("No se encontró la watchlist");
      }

      const response: ApiResponse<WatchListModel> = {
        success: true,
        data: watchList,
        correlationId
      };

      res.json(response);
    } catch (error) {
      return CustomError.handleError(error, res);
    }
  };
}
