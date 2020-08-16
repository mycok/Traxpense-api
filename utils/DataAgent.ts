export abstract class DataAgent<T> {
  abstract async create(data: T): Promise<any>;

  abstract async list(...args: any): Promise<any>;

  abstract async getById(id: string): Promise<any>;

  abstract async update(id: string, updateProps: any): Promise<any>;

  abstract async delete(id: string): Promise<any>;
}
