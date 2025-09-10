import { ENVS } from "@/lib/configs";
import winston from "winston";

export const logger = winston.createLogger({
  level: ENVS.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
