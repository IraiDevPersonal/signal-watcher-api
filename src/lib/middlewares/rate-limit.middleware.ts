import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { getClientIP } from "../get-client-ip";

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: "15 minutes"
    });
  }
});

export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    error: "Límite de solicitudes de IA excedido. Intenta de nuevo en 1 hora.",
    code: "AI_RATE_LIMIT_EXCEEDED",
    retryAfter: "1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Límite de solicitudes de IA excedido. Intenta de nuevo en 1 hora.",
      code: "AI_RATE_LIMIT_EXCEEDED",
      retryAfter: "1 hour"
    });
  },
  keyGenerator: (req: Request) => {
    const ip = getClientIP(req);
    return `ai_${ip}_${req.path}`;
  }
});

export const criticalAiRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 50,
  message: {
    error: "Límite diario de operaciones de IA excedido. Intenta mañana.",
    code: "DAILY_AI_LIMIT_EXCEEDED",
    retryAfter: "24 hours"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Límite diario de operaciones de IA excedido. Intenta mañana.",
      code: "DAILY_AI_LIMIT_EXCEEDED",
      retryAfter: "24 hours"
    });
  },
  keyGenerator: (req: Request) => {
    const ip = getClientIP(req);
    return `daily_ai_${ip}`;
  }
});
