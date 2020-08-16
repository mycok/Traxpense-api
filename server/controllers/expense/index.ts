import { Request, Response } from 'express';
import expenseSchema from '../../validation/schemas/expense/create.json';
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
      expenseSchema,
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

  static async read(req: Request, res: Response): Promise<any> {
    const result = await ExpenseController.expenseDataAgent.getById(
      req.params.expId,
    );

    if (!result) {
      return res
        .status(404)
        .json(new NotFoundError('read-expense', 'Expense not Found'));
    }

    if (typeof result === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('read-expense', result as string).toJSON());
    }

    return res.status(200).json({
      success: true,
      expense: new ExponseResponseModel(
        result as IExpenseDocument,
      ).getResponseModel(),
    });
  }
}
