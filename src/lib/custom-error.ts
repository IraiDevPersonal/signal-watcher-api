import { Response } from "express";

export class CustomError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string
  ) {
    super(message);
  }

  static badRequest(message: string = "no se pudo conectar a la base de datos") {
    return new CustomError(400, message);
  }

  static notFound(message: string = "no encontrado") {
    return new CustomError(404, message);
  }

  static internalServer(message: string = "Error interno del servidor") {
    return new CustomError(500, message);
  }

  static bdError(erro: unknown) {
    const { message } = CustomError.getErrorData(erro);
    return CustomError.internalServer(message);
  }

  static handleError = (error: unknown, res: Response) => {
    const { message, statusCode } = CustomError.getErrorData(error);

    return res.status(statusCode).json({
      code: statusCode,
      errors: message,
      correlationId: res.locals.correlationId || "desconocido"
    });
  };

  static getErrorData(
    error: unknown,
    message?: string
  ): { statusCode: number; message: string; stack?: string } {
    const defaultMessage = message ?? "Error desconocido";
    const defaultStatusCode = 500;

    if (error instanceof CustomError) {
      return {
        statusCode: error.statusCode,
        message: error.message,
        stack: error.stack
      };
    }

    if (error instanceof Error) {
      return {
        statusCode: defaultStatusCode,
        message: error.message || defaultMessage,
        stack: error.stack
      };
    }

    return {
      statusCode: defaultStatusCode,
      message: defaultMessage,
      stack: undefined
    };
  }
}
