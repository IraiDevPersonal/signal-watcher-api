import { CustomError } from "@/lib/custom-error";
import { logger } from "@/lib/logger";
import { PrismaClient } from "@prisma/client";
import { CreateWatchListPayload } from "./models/create-watch-list-payload";

export class WatchListService {
  private readonly bd: PrismaClient;

  constructor() {
    this.bd = new PrismaClient();
  }

  createWatchList = async (data: CreateWatchListPayload, correlationId: string) => {
    try {
      logger.info("Creando watchlist", {
        correlationId,
        name: data.name,
        termsCount: data.terms.length
      });

      const watchList = await this.bd.watchList.create({
        data: {
          name: data.name,
          terms: data.terms
        },
        include: {
          _count: {
            select: { events: true }
          }
        }
      });

      logger.info("Watchlist creada exitosamente", {
        correlationId,
        watchListId: watchList.id
      });

      return {
        id: watchList.id,
        name: watchList.name,
        terms: watchList.terms,
        createdAt: watchList.createdAt.toISOString(),
        updatedAt: watchList.updatedAt.toISOString(),
        eventsCount: watchList._count.events
      };
    } catch (error) {
      const { message, stack } = CustomError.getErrorData(error);
      logger.error("Error al crear watchlist", {
        correlationId,
        error: message,
        stack
      });
      throw CustomError.bdError(error);
    }
  };

  getAllWatchLists = async (correlationId: string) => {
    try {
      logger.info("Obteniendo todas las watchlists", { correlationId });

      const watchLists = await this.bd.watchList.findMany({
        include: {
          _count: {
            select: { events: true }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      return watchLists.map((watchList) => ({
        id: watchList.id,
        name: watchList.name,
        terms: watchList.terms,
        createdAt: watchList.createdAt.toISOString(),
        updatedAt: watchList.updatedAt.toISOString(),
        eventsCount: watchList._count.events
      }));
    } catch (error) {
      logger.error("Error al obtener watchlists", {
        correlationId,
        error: CustomError.getErrorData(error).message
      });
      throw CustomError.bdError(error);
    }
  };

  getWatchListById = async (id: string, correlationId: string) => {
    try {
      logger.info(`Buscando watchlist para ID: ${id}`, { correlationId });

      const watchList = await this.bd.watchList.findUnique({
        where: { id },
        include: {
          _count: {
            select: { events: true }
          }
        }
      });

      if (!watchList) {
        return null;
      }

      return {
        id: watchList.id,
        name: watchList.name,
        terms: watchList.terms,
        createdAt: watchList.createdAt.toISOString(),
        updatedAt: watchList.updatedAt.toISOString(),
        eventsCount: watchList._count.events
      };
    } catch (error) {
      logger.error(`Error al obtener watchlist para ID: ${id}`, {
        correlationId,
        watchListId: id,
        error: CustomError.getErrorData(error).message
      });
      throw CustomError.bdError(error);
    }
  };
}
