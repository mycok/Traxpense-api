import { Response } from 'express';
import createExpenseSchema from '../../validation/schemas/expense/create.json';
import updateExpenseSchema from '../../validation/schemas/expense/update.json';
import { Validator } from '../../validation/validators';
import { BadRequestError } from '../../extensions/BadRequestError';
import { ExpenseDataAgent } from '../../database/data-agents/expense/ExpenseDataAgent';
import { IExpenseDocument } from '../../database/data-abstracts';
import { ExponseResponseModel } from '../../database/data-abstracts/expense/ExpenseResponseModel';
import { NotFoundError } from '../../extensions/NotFoundError';

interface IExpenseRequest {
  title: string;
  amount: number;
  category: string;
  Notes?: string;
}

export class ExpenseController {
  private static expenseDataAgent = new ExpenseDataAgent();

  static async create(req: any, res: Response): Promise<any> {
    const { auth, body } = req;
    const validationResults = Validator.validate<IExpenseRequest>(
      createExpenseSchema,
      'expense',
      body,
    );

    if (typeof validationResults === 'string') {
      return res
        .status(400)
        .json(
          new BadRequestError('create-expense', validationResults).toJSON(),
        );
    }

    const result = await ExpenseController.expenseDataAgent.create({
      ...body,
      recordedBy: auth._id,
    });

    if (typeof result === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('create-expense', result as string).toJSON());
    }

    return res.status(201).json({
      success: true,
      expense: new ExponseResponseModel(result).getResponseModel(),
    });
  }

  static async list(req: any, res: Response): Promise<any> {
    let hasNextPage = false;
    const limit = 10;
    const {
      auth,
      query: { cursor, startDate, endDate },
    } = req;

    let expenses: IExpenseDocument[] = await ExpenseController.expenseDataAgent.list(
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
      cursor: hasNextPage ? expenses[expenses.length - 1]._id : 'done',
      hasNextPage,
    });
  }

  static async read(req: any, res: Response): Promise<any> {
    const { expense } = req;

    return res.status(200).json({
      success: true,
      expense: { ...new ExponseResponseModel(expense).getResponseModel() },
    });
  }

  static async update(req: any, res: Response): Promise<any> {
    const {
      expense: { _id },
      body,
    } = req;
    const validationResults = Validator.validate<IExpenseRequest>(
      updateExpenseSchema,
      'expense',
      body,
    );

    if (typeof validationResults === 'string') {
      return res
        .status(400)
        .json(
          new BadRequestError('create-expense', validationResults).toJSON(),
        );
    }

    const result = await ExpenseController.expenseDataAgent.update(_id, body);

    if (typeof result !== 'object') {
      return res.status(400).json(new BadRequestError('update', result));
    }

    return res.status(200).json({
      success: true,
      expense: new ExponseResponseModel(result).getResponseModel(),
    });
  }

  static async delete(req: any, res: Response): Promise<any> {
    const {
      expense: { _id },
    } = req;

    const deletedResponse = await ExpenseController.expenseDataAgent.delete(
      _id,
    );

    if (typeof deletedResponse === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('delete', deletedResponse));
    }

    return res.status(200).json({
      success: true,
      deletedResponse,
    });
  }

  static async currentMonthPreview(req: any, res: Response): Promise<any> {
    const {
      auth: { _id },
    } = req;
    const currentPreview = await ExpenseController.expenseDataAgent.currentMonthPreview(
      _id,
    );

    return res.status(200).json({
      success: true,
      expensePreview: {
        month: currentPreview[0].month[0],
        today: currentPreview[0].today[0],
        yesterday: currentPreview[0].yesterday[0],
      },
    });
  }

  static async expensesByCategory(req: any, res: Response): Promise<any> {
    const {
      auth: { _id },
    } = req;

    const categoryExpAggregates = await ExpenseController.expenseDataAgent.expensesByCategory(
      _id,
    );

    return res.status(200).json({
      success: true,
      categoryExpAggregates,
    });
  }

  // helper methods
  static async getById(
    req: any,
    res: Response,
    next: Function,
    expId: string,
  ): Promise<any> {
    const expense = await ExpenseController.expenseDataAgent.getById(expId);

    if (!expense) {
      return res
        .status(404)
        .json(new NotFoundError('getById', 'Expense not found').toJSON());
    }
    req.expense = expense;

    return next();
  }
}
