export interface Controller<P = any, R = any> {
  handle(params: P): Promise<R>;
}
