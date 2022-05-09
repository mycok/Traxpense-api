/* eslint-disable max-len */
import { Response } from 'express';
import { EventEmitter } from 'events';

import createExpenseSchema from '../../validation/schemas/expense/create.json';
import updateExpenseSchema from '../../validation/schemas/expense/update.json';
import { Validator } from '../../validation/validators';
import { BadRequestError } from '../../extensions/BadRequestError';
import {
  ExpenseDataAgent,
  IExpenseDataAgent,
} from '../../database/data-agents/expense/ExpenseDataAgent';
import { IExpenseDocument, ExpenseModelResponse } from '../../database/data-abstracts';
import { NotFoundError } from '../../extensions/NotFoundError';
import { walletController } from '../wallet';

type ExpenseRequest = {
  title: string;
  amount: number;
  category: string;
  Notes?: string;
};

class ExpenseController extends EventEmitter {
  private readonly _expenseDataAgent: IExpenseDataAgent;

  constructor(dataAgent: IExpenseDataAgent) {
    super();
    this._expenseDataAgent = dataAgent;
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.read = this.read.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.currentMonthExpPreview = this.currentMonthExpPreview.bind(this);
    this.totalExpBycategoryForPeriod = this.totalExpBycategoryForPeriod.bind(this);
    this.scatteredPlotExpData = this.scatteredPlotExpData.bind(this);
    this.annualExpData = this.annualExpData.bind(this);
    this.currentMonthAvgTotalExpByCategory = this.currentMonthAvgTotalExpByCategory.bind(
      this,
    );
    this.getById = this.getById.bind(this);
  }

  async create(req: any, res: Response): Promise<Response> {
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

    const eventParams = { req, didAddExpense: true };
    this.emit('new_expense_added', eventParams);

    return res.status(201).json({
      success: true,
      expense: new ExpenseModelResponse(result).getResponseModel(),
    });
  }

  async list(req: any, res: Response): Promise<Response> {
    let hasNextPage = false;

    const limit = 10;

    const {
      auth,
      query: { cursor, startDate, endDate },
    } = req;

    let expenses: IExpenseDocument[] = await this._expenseDataAgent.list({
      userId: auth._id,
      limit,
      startDate,
      endDate,
      cursor,
    });

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

  async read(req: any, res: Response): Promise<Response> {
    const { expense } = req;

    return res.status(200).json({
      success: true,
      expense: { ...new ExpenseModelResponse(expense).getResponseModel() },
    });
  }

  async update(req: any, res: Response): Promise<Response> {
    const { expense, body } = req;

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

    const result = await this._expenseDataAgent.update(expense._id, body);

    if (typeof result !== 'object') {
      return res.status(400).json(new BadRequestError('update', result));
    }

    // Only emit this event if the expense amount has been updated.
    if (expense.amount !== result.amount) {
      const adjustedAmount = Math.abs(expense.amount - result.amount);

      const eventParams = {
        req: {
          auth: req.auth,
          expense: { ...result, amount: adjustedAmount },
        },
        expenseOrWalletUpdate: { shouldDeductBalance: true },
      };

      if (expense.amount > result.amount) {
        eventParams.expenseOrWalletUpdate = { shouldDeductBalance: false };
      }

      this.emit('expense_amount_updated', eventParams);
    }

    return res.status(200).json({
      success: true,
      expense: new ExpenseModelResponse(result).getResponseModel(),
    });
  }

  async delete(req: any, res: Response): Promise<Response> {
    const {
      expense: { _id },
    } = req;

    const deletedResponse = await this._expenseDataAgent.delete(_id);

    if (typeof deletedResponse === 'string') {
      return res.status(400).json(new BadRequestError('delete', deletedResponse));
    }

    const eventParams = { req };
    this.emit('expense_deleted', eventParams);

    return res.status(200).json({
      success: true,
      deletedResponse,
    });
  }

  async currentMonthExpPreview(req: any, res: Response): Promise<Response> {
    const {
      auth: { _id },
    } = req;

    const currentMonthExpenditurePreview = await this._expenseDataAgent.currentMonthExpPreview(
      _id,
    );

    return res.status(200).json({
      success: true,
      currentMonthExpenditurePreview: {
        month: currentMonthExpenditurePreview[0].month[0],
        today: currentMonthExpenditurePreview[0].today[0],
        yesterday: currentMonthExpenditurePreview[0].yesterday[0],
      },
    });
  }

  async currentMonthAvgTotalExpByCategory(req: any, res: Response): Promise<Response> {
    const {
      auth: { _id },
    } = req;

    const currentMonthAvgTotalExpenditureByCategory = await this._expenseDataAgent.currentMonthAvgTotalExpByCategory(
      _id,
    );

    return res.status(200).json({
      success: true,
      currentMonthAvgTotalExpenditureByCategory,
    });
  }

  async scatteredPlotExpData(req: any, res: Response): Promise<Response> {
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

  async annualExpData(req: any, res: Response): Promise<Response> {
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

  async totalExpBycategoryForPeriod(req: any, res: Response): Promise<Response> {
    const {
      auth: { _id },
      query: { startDate, endDate },
    } = req;

    const totalExpBycategory = await this._expenseDataAgent.totalExpBycategoryForPeriod(
      _id,
      startDate,
      endDate,
    );

    return res.status(200).json({
      success: true,
      totalExpBycategory,
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

expenseController.on('new_expense_added', walletController.updateOnExpenseChange);
expenseController.on('expense_deleted', walletController.updateOnExpenseChange);
expenseController.on('expense_amount_updated', walletController.updateOnExpenseChange);
