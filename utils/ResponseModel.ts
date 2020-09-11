export interface ResponseModel<T> {
  readonly _document: T;
  getResponseModel(): Partial<T>;
}
