import z from "zod";
import { CustomError } from "../custom-error";
import { NextFunction, Request, Response } from "express";

export const validateSchemaMiddleware = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      return CustomError.handleError(error, res);
    }
  };
};
