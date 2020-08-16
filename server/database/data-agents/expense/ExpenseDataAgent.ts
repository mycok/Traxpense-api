import { IExpenseDocument, ExpenseModel } from '../../data-abstracts';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';
import { DataAgent } from '../../../../utils/DataAgent';

// TODO: - add pagination for lists
export class ExpenseDataAgent extends DataAgent<IExpenseDocument> {
  async create(
    expenseData: IExpenseDocument,
  ): Promise<IExpenseDocument | string> {
    const expense = await ExpenseModel.create(expenseData).catch((err) => handleErrorMessages(err));

    return expense;
  }

  /*
    we use cursor based pagination along with a
    date filter to return a paginated list filtered by date,
    ordered by _id and in a descending order.
    the cursor filter is based on the same predicate as the sort filter,
    that is if cursor is in descending order, then the sort filter follows suit
  */
  async list(
    limit: number,
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    cursor?: string,
  ): Promise<IExpenseDocument[]> {
    let cursorQuery = {};
    let dateQuery = {};

    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }

    if (startDate && endDate) {
      dateQuery = {
        $and: [
          { incurredOn: { $gte: startDate, $lte: endDate } },
          { recordedBy: userId },
        ],
      };
    }
    const expenses: IExpenseDocument[] = await ExpenseModel.find({
      ...dateQuery,
      ...cursorQuery,
    })
      .populate('recordedBy', 'username email')
      .limit(limit + 1)
      .sort({ incurredOn: -1 })
      .select('_id title amount category notes incurredOn createdAt');

    return expenses;
  }

  async getById(expId: string): Promise<IExpenseDocument | string> {
    const expense = await ExpenseModel.findById(expId).catch((err) => handleErrorMessages(err));

    return expense;
  }

  async update(): Promise<any> {
    return Promise.resolve(null);
  }

  async delete(): Promise<any> {
    return Promise.resolve(null);
  }
}
