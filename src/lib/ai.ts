import OpenAI from "openai";
import { ENVS } from "./configs";
import { logger } from "./logger";
import { CustomError } from "./custom-error";

const openaiClient = new OpenAI({
  apiKey: ENVS.OPENAI_API_KEY
});

export const aiClient = async (prompt: string, correlationId: string) => {
  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const raw = response.choices[0].message.content;
    if (!raw) {
      throw CustomError.internalServer("No se obtuvo respuesta de la IA");
    }

    return JSON.parse(raw);
  } catch (error) {
    logger.error("No se obtuvo respuesta de la IA", { correlationId, error });
    throw error;
  }
};
