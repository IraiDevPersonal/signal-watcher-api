export type ResponseModel<T, C extends number = number> = {
  code: C;
  data: T;
};
