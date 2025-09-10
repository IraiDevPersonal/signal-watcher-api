import "dotenv/config";
import { get } from "env-var";

export const ENVS = {
  PORT: get("PORT").required().asPortNumber(),
  POSTGRES_DB: get("POSTGRES_DB").required().asString(),
  POSTGRES_USER: get("POSTGRES_USER").required().asString(),
  POSTGRES_PASSWORD: get("POSTGRES_PASSWORD").required().asString(),
  POSTGRES_URL: get("POSTGRES_URL").required().asString(),
  LOG_LEVEL: get("LOG_LEVEL").default("info").asString(),
  OPENAI_API_KEY: get("OPENAI_API_KEY").required().asString()
};
