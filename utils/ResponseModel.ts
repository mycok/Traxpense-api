export interface ResponseModel<T> {
  readonly document: T;
  getResponseModel(): Partial<T>;
}
