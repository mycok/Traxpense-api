import {
  Model, Document, CreateQuery, UpdateQuery, Types,
} from 'mongoose';

import { DataAgent } from './DataAgent';
import { handleErrorMessages } from '../../../utils/dbErrorHandler';

export class BaseDataAgent<T extends Document> extends DataAgent<T> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    super();
    this.model = model;
  }

  async create(data: CreateQuery<T>): Promise<T | string> {
    const result = await this.model
      .create(data)
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }

  async list(...args: any): Promise<T[]> {
    const results: T[] = await this.model.find();

    return results;
  }

  async getById(id: string): Promise<T | null> {
    const result = await this.model.findById(Types.ObjectId(id));

    return result;
  }

  async update(id: string, propsToUpdate: UpdateQuery<T>): Promise<T | string> {
    const result = await this.model
      .findByIdAndUpdate({ _id: Types.ObjectId(id) }, propsToUpdate, {
        omitUndefined: true,
        new: true,
        runValidators: true,
      })
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }

  async delete(id: string): Promise<any> {
    const result = await this.model
      .findByIdAndDelete({
        _id: Types.ObjectId(id),
      })
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }
}
