import { Model, model } from 'mongoose';

import { IExpenseDocument } from './IExpenseDocument';
import { ExpenseSchema } from './ExpenseSchema';

type IExpenseModel = Model<IExpenseDocument>;
export const ExpenseModel: IExpenseModel = model('Expense', ExpenseSchema);
