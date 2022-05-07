import { Request, Response } from 'express';

import { BadRequestError } from '../../extensions/BadRequestError';
import {
  CategoryDataAgent,
  ICategoryDataAgent,
} from '../../database/data-agents/category/CategoryDataAgent';
import { ICategoryDocument, CategoryModelResponse } from '../../database/data-abstracts';

// TODO: add read, update and delete methods if necessary
class CategoryController {
  private readonly _categoryDataAgent: ICategoryDataAgent;

  constructor(dataAgent: ICategoryDataAgent) {
    this._categoryDataAgent = dataAgent;
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.listByUser = this.listByUser.bind(this);
  }

  async create(req: any, res: Response): Promise<any> {
    const { body, auth } = req;
    const categoryRequest: any = { title: body.title, user: auth._id };

    if (body?.createdByAdmin) categoryRequest.createdByAdmin = body.createdByAdmin;

    const result = await this._categoryDataAgent.create(
      categoryRequest as ICategoryDocument,
    );

    if (typeof result === 'string') {
      return res.status(400).json(new BadRequestError('create', result).toJSON());
    }

    return res.status(201).json({
      success: true,
      category: new CategoryModelResponse(result).getResponseModel(),
    });
  }

  async list(req: Request, res: Response): Promise<any> {
    const categories = await this._categoryDataAgent.list();

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories:
        categories.length > 0
          ? new CategoryModelResponse(categories[0]).getResponseModelFromList(categories)
          : categories,
    });
  }

  async listByUser(req: any, res: Response): Promise<any> {
    const { auth } = req;
    const categories = await this._categoryDataAgent.listByUser(auth._id);

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

export const categoryController = new CategoryController(new CategoryDataAgent());
