import { Document, CreateQuery, UpdateQuery } from 'mongoose';

export abstract class DataAgent<T extends Document> {
  abstract create(data: CreateQuery<T>): Promise<T | string>;

  abstract list(...args: any): Promise<T[]>;

  abstract getById(id: string): Promise<T | null>;

  abstract update(id: string, updateProps: UpdateQuery<T>): Promise<T | string>;

  abstract delete(id: string): Promise<any>;
}
