export type ApiResponse<T = unknown> = {
  success: boolean;
  data: T;
  correlationId: string;
};
