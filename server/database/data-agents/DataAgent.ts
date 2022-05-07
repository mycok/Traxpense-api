import { Document, CreateQuery, UpdateQuery } from 'mongoose';

export interface IDataAgent<T extends Document> {
  create(data: CreateQuery<T>): Promise<T | string>;

  list(...args: any): Promise<T[]>;

  getById(id: string): Promise<T | null>;

  update(id: string, updateProps: UpdateQuery<T>, ...otherArgs: any): Promise<T | string>;

  delete(id: string): Promise<any>;
}
