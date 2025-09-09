import z from "zod";

export const CreateEventSchema = z.object({
  type: z.string(),
  description: z.string(),
  watchListId: z.string()
});

export type CreateEventPayload = z.infer<typeof CreateEventSchema>;
