import { CustomError } from "@/lib/custom-error";
import { logger } from "@/lib/logger";
import { PrismaClient, Prisma } from "@prisma/client";
import { CreateWatchListPayload } from "./models/create-watch-list-payload";
import { WatchListModel } from "./models/watch-list";
import { memoryCache } from "@/lib/cache";

type WatchListWithCount = Prisma.WatchListGetPayload<{
  include: {
    _count: {
      select: { events: true };
    };
  };
}>;

export class WatchListService {
  private readonly bd: PrismaClient;
  private readonly queryCacheKey = "watchlist";

  constructor() {
    this.bd = new PrismaClient();
  }

  private mapWatchListToModel = (watchList: WatchListWithCount): WatchListModel => {
    return {
      id: watchList.id,
      name: watchList.name,
      terms: watchList.terms,
      createdAt: watchList.createdAt.toISOString(),
      updatedAt: watchList.updatedAt.toISOString(),
      eventsCount: watchList._count.events
    };
  };

  createWatchList = async (data: CreateWatchListPayload, correlationId: string): Promise<WatchListModel> => {
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

      const watchListModel = this.mapWatchListToModel(watchList);
      const logInfo = { correlationId, watchListId: watchListModel.id };

      logger.info("Watchlist creada exitosamente", logInfo);

      memoryCache.delByPrefix(this.queryCacheKey);
      logger.info("Cache de watchlists limpiado", { correlationId });

      memoryCache.set(memoryCache.buildCacheKey(this.queryCacheKey, [watchListModel.id]), watchListModel);
      logger.info("Watchlist guardada en cache", logInfo);

      return watchListModel;
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

  getAllWatchLists = async (correlationId: string): Promise<WatchListModel[]> => {
    try {
      const cacheKey = memoryCache.buildCacheKey(this.queryCacheKey, [], "list");
      const cachedWatchLists = memoryCache.get<WatchListModel[]>(cacheKey);

      if (cachedWatchLists) {
        logger.info("Se obtuvieron watchlists del cache", { correlationId, cacheKey });
        return cachedWatchLists;
      }

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

      const mappedWatchLists = watchLists.map(this.mapWatchListToModel);

      memoryCache.set(cacheKey, mappedWatchLists);
      logger.info("Cache de watchlists actualizado", { correlationId });

      return mappedWatchLists;
    } catch (error) {
      logger.error("Error al obtener watchlists", {
        correlationId,
        error: CustomError.getErrorData(error).message
      });
      throw CustomError.bdError(error);
    }
  };

  getWatchListById = async (id: string, correlationId: string): Promise<WatchListModel | null> => {
    try {
      const cacheKey = memoryCache.buildCacheKey(this.queryCacheKey, [id], "unique");
      const cachedWatchList = memoryCache.get<WatchListModel>(cacheKey);

      if (cachedWatchList) {
        logger.info("Se obtuvo watchlist del cache", {
          correlationId,
          cacheKey,
          watchListId: id
        });
        return cachedWatchList;
      }

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

      const watchListModel = this.mapWatchListToModel(watchList);

      memoryCache.set(cacheKey, watchListModel);
      logger.info("Cache de watchlist actualizado", { correlationId, watchListId: id });

      return watchListModel;
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
