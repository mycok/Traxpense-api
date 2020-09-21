import { CategoryModel, ICategoryDocument } from '../../data-abstracts';
import { BaseDataAgent } from '../../../../utils/BaseDataAgent';

export class CategoryDataAgent extends BaseDataAgent<ICategoryDocument> {
  constructor() {
    super(CategoryModel);
  }
}
