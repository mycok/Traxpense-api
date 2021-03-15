export abstract class DataAgent<T> {
  abstract create(data: T): Promise<any>;

  abstract list(...args: any): Promise<any>;

  abstract getById(id: string): Promise<any>;

  abstract update(id: string, updateProps: any): Promise<any>;

  abstract delete(id: string): Promise<any>;
}
