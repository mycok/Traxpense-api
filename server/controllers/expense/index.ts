import { Request, Response } from 'express';
import expenseSchema from '../../validation/schemas/expense/create.json';
import { Validator } from '../../validation/validators';
import { BadRequestError } from '../../extensions/BadRequestError';
import { ExpenseDataAgent } from '../../database/data-agents/expense/ExpenseDataAgent';
import { IExpenseDocument } from '../../database/data-abstracts';
import { ExponseResponseModel } from '../../database/data-abstracts/expense/ExpenseResponseModel';

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

    if (typeof result !== 'string') {
      return res.status(201).json({
        success: true,
        expense: new ExponseResponseModel(result).getResponseModel(),
      });
    }
    return res
      .status(400)
      .json(new BadRequestError('create-expense', result as string).toJSON());
  }

  static async list(req: Request, res: Response): Promise<any> {
    const expenses: IExpenseDocument[] = await ExpenseController.expenseDataAgent.list();

    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  }
}
