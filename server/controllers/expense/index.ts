import { Response } from 'express';
import { EventEmitter } from 'events';

import createExpenseSchema from '../../validation/schemas/expense/create.json';
import updateExpenseSchema from '../../validation/schemas/expense/update.json';
import { Validator } from '../../validation/validators';
import { BadRequestError } from '../../extensions/BadRequestError';
import { ExpenseDataAgent } from '../../database/data-agents/expense/ExpenseDataAgent';
import { IExpenseDocument, ExpenseModelResponse } from '../../database/data-abstracts';
import { NotFoundError } from '../../extensions/NotFoundError';
import { WalletController } from '../wallet';

type ExpenseRequest = {
  title: string;
  amount: number;
  category: string;
  Notes?: string;
};

class ExpenseController extends EventEmitter {
  private _expenseDataAgent: ExpenseDataAgent;

  constructor(dataAgent: ExpenseDataAgent) {
    super();
    this._expenseDataAgent = dataAgent;
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.read = this.read.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.currentMonthPreview = this.currentMonthPreview.bind(this);
    this.expensesByCategory = this.expensesByCategory.bind(this);
    this.scatteredPlotExpData = this.scatteredPlotExpData.bind(this);
    this.annualExpData = this.annualExpData.bind(this);
    this.avgExpBycategory = this.avgExpBycategory.bind(this);
    this.getById = this.getById.bind(this);
  }

  async create(req: any, res: Response): Promise<any> {
    const { auth, body } = req;
    const validationResults = new Validator().validate<ExpenseRequest>(
      createExpenseSchema,
      'expense',
      body,
    );

    if (typeof validationResults === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('create-expense', validationResults).toJSON());
    }

    const result = await this._expenseDataAgent.create({
      ...body,
      recordedBy: auth._id,
      category: body.category._id,
    });

    if (typeof result === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('create-expense', result as string).toJSON());
    }

    req.expense = result;
    this.emit('new-expense-added', req, res);

    return res.status(201).json({
      success: true,
      expense: new ExpenseModelResponse(result).getResponseModel(),
    });
  }

  async list(req: any, res: Response): Promise<any> {
    let hasNextPage = false;
    const limit = 10;
    const {
      auth,
      query: { cursor, startDate, endDate },
    } = req;

    let expenses: IExpenseDocument[] = await this._expenseDataAgent.list(
      limit,
      auth._id,
      startDate,
      endDate,
      cursor,
    );

    if (expenses.length > limit) {
      hasNextPage = true;
      expenses = expenses.slice(0, -1);
    }
    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
      cursor: hasNextPage ? expenses[expenses.length - 1].incurredOn : 'done',
      hasNextPage,
    });
  }

  async read(req: any, res: Response): Promise<any> {
    const { expense } = req;

    return res.status(200).json({
      success: true,
      expense: { ...new ExpenseModelResponse(expense).getResponseModel() },
    });
  }

  async update(req: any, res: Response): Promise<any> {
    const {
      expense: { _id },
      body,
    } = req;
    const validationResults = new Validator().validate<ExpenseRequest>(
      updateExpenseSchema,
      'expense',
      body,
    );

    if (typeof validationResults === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('create-expense', validationResults).toJSON());
    }

    const result = await this._expenseDataAgent.update(_id, body);

    if (typeof result !== 'object') {
      return res.status(400).json(new BadRequestError('update', result));
    }

    return res.status(200).json({
      success: true,
      expense: new ExpenseModelResponse(result).getResponseModel(),
    });
  }

  async delete(req: any, res: Response): Promise<any> {
    const {
      expense: { _id },
    } = req;

    const deletedResponse = await this._expenseDataAgent.delete(_id);

    if (typeof deletedResponse === 'string') {
      return res.status(400).json(new BadRequestError('delete', deletedResponse));
    }

    return res.status(200).json({
      success: true,
      deletedResponse,
    });
  }

  async currentMonthPreview(req: any, res: Response): Promise<any> {
    const {
      auth: { _id },
    } = req;
    const currentPreview = await this._expenseDataAgent.currentMonthPreview(_id);

    return res.status(200).json({
      success: true,
      expensePreview: {
        month: currentPreview[0].month[0],
        today: currentPreview[0].today[0],
        yesterday: currentPreview[0].yesterday[0],
      },
    });
  }

  async expensesByCategory(req: any, res: Response): Promise<any> {
    const {
      auth: { _id },
    } = req;

    const categoryExpAggregates = await this._expenseDataAgent.expensesByCategory(_id);

    return res.status(200).json({
      success: true,
      categoryExpAggregates,
    });
  }

  async scatteredPlotExpData(req: any, res: Response): Promise<any> {
    const {
      auth: { _id },
      query: { period },
    } = req;

    const plotData = await this._expenseDataAgent.scatteredPlotExpData(_id, period);

    return res.status(200).json({
      success: true,
      plotData,
    });
  }

  async annualExpData(req: any, res: Response): Promise<any> {
    const {
      auth: { _id },
      query: { year },
    } = req;

    const annualExpData = await this._expenseDataAgent.annualExpData(_id, year);

    return res.status(200).json({
      success: true,
      annualExpData,
    });
  }

  async avgExpBycategory(req: any, res: Response): Promise<any> {
    const {
      auth: { _id },
      query: { startDate, endDate },
    } = req;

    const avgerageExpByCategory = await this._expenseDataAgent.avgExpBycategory(
      _id,
      startDate,
      endDate,
    );

    return res.status(200).json({
      success: true,
      avgerageExpByCategory,
    });
  }

  /**
   * Middleware
   *
   * @param req
   * @param res
   * @param next
   * @param expId
   *
   * Retrieves a specific expense using the provided [expId]
   *  and attaches it to the request under the expense property
   */
  async getById(req: any, res: Response, next: Function, expId: string): Promise<any> {
    const expense = await this._expenseDataAgent.getById(expId);

    if (!expense) {
      return res
        .status(404)
        .json(new NotFoundError('getById', 'Expense not found').toJSON());
    }
    req.expense = expense;

    return next();
  }
}

export const expenseController = new ExpenseController(new ExpenseDataAgent());
expenseController.on('new-expense-added', WalletController.updateOnNewExpense);
