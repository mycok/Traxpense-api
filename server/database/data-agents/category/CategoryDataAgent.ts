import { CategoryModel, ICategoryDocument } from '../../data-abstracts';
import { BaseDataAgent } from '../BaseDataAgent';
import { IDataAgent } from '../DataAgent';

export interface ICategoryDataAgent extends IDataAgent<ICategoryDocument> {
  listByUser(userId: string): Promise<ICategoryDocument[]>;
}
/**
 * TODO: consider implementing the DataRepository interface instead of extending BaseDataRepository
 * since that means we are inheriting functionality that we don't need at the moment
 * such as (update, delete) functionality
 */
export class CategoryDataAgent extends BaseDataAgent<ICategoryDocument> {
  constructor() {
    super(CategoryModel);
  }

  async list(...args: any): Promise<ICategoryDocument[]> {
    const results = await this.model.find({
      createdByAdmin: true,
    });

    return results;
  }

  async listByUser(userId: string): Promise<ICategoryDocument[]> {
    const results = await this.model.find({
      user: userId,
    });

    return results;
  }
}
