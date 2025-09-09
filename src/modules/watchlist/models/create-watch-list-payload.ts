import z from "zod";

export const CreateWatchListSchema = z.object({
  name: z.string(),
  terms: z.array(z.string())
});

export type CreateWatchListPayload = z.infer<typeof CreateWatchListSchema>;
