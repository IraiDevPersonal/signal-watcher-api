import { GoogleGenAI } from "@google/genai";
import { ENVS } from "./configs";
import { CustomError } from "./custom-error";
import { logger } from "./logger";

type ClientOptions = {
  prompt: string;
  correlationId: string;
  systemInstruction?: string;
};

const googleClient = new GoogleGenAI({
  apiKey: ENVS.GEMINI_API_KEY
});

export const aiClient = async ({ prompt, correlationId, systemInstruction }: ClientOptions) => {
  try {
    const response = await googleClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    if (!response.text) {
      throw CustomError.internalServer("No se obtuvo respuesta de la IA");
    }
    return JSON.parse(response.text);
  } catch (error) {
    logger.error("No se obtuvo respuesta de la IA", { correlationId, error });
    throw error;
  }
};
