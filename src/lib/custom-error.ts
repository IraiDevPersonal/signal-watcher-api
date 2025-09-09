import { Response } from "express";

export class CustomError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string
  ) {
    super(message);
  }

  static badRequest(message: string = "could not connect to db") {
    return new CustomError(400, message);
  }

  static notFound(message: string = "not found") {
    return new CustomError(404, message);
  }

  static internalServer(message: string = "internal server error") {
    return new CustomError(500, message);
  }

  static handleError = (error: unknown, res: Response) => {
    const { message, statusCode } = this.getError(error);

    return res.status(statusCode).json({ code: statusCode, errors: message });
  };

  static getError(error: unknown): { statusCode: number; message: string } {
    const defaultMessage = "An unknown error occurred";
    const defaultStatusCode = 500;

    if (error instanceof CustomError) {
      return {
        statusCode: error.statusCode,
        message: error.message
      };
    }

    if (error instanceof Error) {
      return {
        statusCode: defaultStatusCode,
        message: error.message || defaultMessage
      };
    }

    return {
      statusCode: defaultStatusCode,
      message: defaultMessage
    };
  }
}
