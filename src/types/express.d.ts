// Extend Express Request interface to include custom properties
declare namespace Express {
  interface Request {
    correlationId: string;
  }
}
