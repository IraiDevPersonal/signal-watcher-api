import { Uid } from "@/lib/uid";
import { NextFunction, Request, Response } from "express";

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.correlationId = (req.headers["x-correlation-id"] as string) || Uid.generate();
  res.setHeader("x-correlation-id", req.correlationId);
  res.locals.correlationId = req.correlationId;
  next();
};
