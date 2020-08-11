import { Response } from 'express';
import expenseSchema from '../../validation/schemas/expense/create.json';
import { Validator } from '../../validation/validators';
import { BadRequestError } from '../../extensions/BadRequestError';
import { ExpenseDataAgent } from '../../database/data-agents/expense/ExpenseDataAgent';

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
        expense: result,
      });
    }
    return res
      .status(400)
      .json(new BadRequestError('create-expense', result as string).toJSON());
  }
}
