import { Model, model } from 'mongoose';

import { ICategoryDocument } from './ICategoryDocument';
import { CategorySchema } from './CategorySchema';

type ICategoryModel = Model<ICategoryDocument>;

export const CategoryModel: ICategoryModel = model('Category', CategorySchema);
