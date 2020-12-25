import { Request, Response } from 'express';

import { BadRequestError } from '../../extensions/BadRequestError';
import { CategoryDataAgent } from '../../database/data-agents/category/CategoryDataAgent';
import { ICategoryDocument, CategoryModelResponse } from '../../database/data-abstracts';

// TODO: add read, update and delete methods if necessary
export class CategoryController {
  private static _categoryDataAgent = new CategoryDataAgent();

  static async create(req: Request, res: Response): Promise<any> {
    const { body } = req;
    const result = await CategoryController._categoryDataAgent.create(body);

    if (typeof result === 'string') {
      return res.status(400).json(new BadRequestError('create', result).toJSON());
    }

    return res.status(201).json({
      success: true,
      category: new CategoryModelResponse(result).getResponseModel(),
    });
  }

  static async list(req: Request, res: Response): Promise<any> {
    const categories: ICategoryDocument[] = await CategoryController._categoryDataAgent.list();

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories:
        categories.length > 0
          ? new CategoryModelResponse(categories[0]).getResponseModelFromList(categories)
          : categories,
    });
  }
}
