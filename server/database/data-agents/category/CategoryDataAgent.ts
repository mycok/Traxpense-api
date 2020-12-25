import { CategoryModel, ICategoryDocument } from '../../data-abstracts';
import { BaseDataAgent } from '../../../../utils/BaseDataAgent';

/**
 * TODO: consider implementing the DataRepository interface instead of extending BaseDataRepository
 * since that means we are inheriting functionality that we don't need at the moment
 * such as (update, delete) functionality
 */
export class CategoryDataAgent extends BaseDataAgent<ICategoryDocument> {
  constructor() {
    super(CategoryModel);
  }
}
