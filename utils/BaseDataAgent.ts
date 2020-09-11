import { DataAgent } from './DataAgent';
import { handleErrorMessages } from './dbErrorHandler';

export class BaseDataAgent<T> extends DataAgent<T> {
  private _model: any;

  constructor(model: any) {
    super();
    this._model = model;
  }

  async create(userData: T): Promise<T | string> {
    const result = await this._model
      .create(userData)
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }

  async list(...args: any): Promise<T[]> {
    const results: T[] = await this._model.find();

    return results;
  }

  async getById(id: string): Promise<T | null> {
    const result = await this._model.findById(id);

    return result;
  }

  async update(id: string, propsToUpdate: any): Promise<T | string> {
    const result = await this._model
      .findOneAndUpdate({ _id: id }, propsToUpdate, {
        omitUndefined: true,
        new: true,
        runValidators: true,
      })
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }

  async delete(id: string): Promise<any> {
    const result = await this._model
      .deleteOne({
        _id: id,
      })
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }
}
