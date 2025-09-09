import z from "zod";
import { CustomError } from "../custom-error";

export const validateSchema = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      return CustomError.handleError(error, res);
    }
  };
};
