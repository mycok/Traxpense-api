import { Types } from 'mongoose';

import { IExpenseDocument, ExpenseModel } from '../../data-abstracts';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';
import { DataAgent } from '../../../../utils/DataAgent';

// TODO: add error handling for all aggregate data handlers
export class ExpenseDataAgent extends DataAgent<IExpenseDocument> {
  async create(
    expenseData: IExpenseDocument,
  ): Promise<IExpenseDocument | string> {
    const result = await ExpenseModel.create(expenseData).catch((err) => handleErrorMessages(err));

    return result;
  }

  /**
   * Uses cursor based pagination along with a date filter to return
   a paginated list filtered by date, ordered by _id and in a descending order.

   * The cursor filter is based on the same predicate as the sort filter,
    that is if cursor is in descending order, then the sort filter follows suit.

   * TODO: - add protection for quering other user's expenses by sending a query without any filters
   */

  async list(
    limit: number,
    userId: string,
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
    const result = await ExpenseModel.findById(expId)
      .populate('recordedBy')
      .catch((err) => handleErrorMessages(err));

    return result;
  }

  async update(
    expId: string,
    propsToUpdate: any,
  ): Promise<IExpenseDocument | string> {
    const result = await ExpenseModel.findOneAndUpdate(
      { _id: expId },
      propsToUpdate,
      {
        omitUndefined: true,
        new: true,
        runValidators: true,
      },
    ).catch((err) => handleErrorMessages(err));

    return result;
  }

  async delete(expId: string): Promise<any> {
    const result = await ExpenseModel.deleteOne({
      _id: expId,
    }).catch((err) => handleErrorMessages(err));

    return result;
  }

  /**
   * @param userId
   * @returns
   *  A preview of the expenses incurred so far in the current month
   *  grouped as yesterday, today and currentMonth
   */
  async currentMonthPreview(userId: string): Promise<any> {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const today = new Date();

    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date();

    tomorrow.setUTCHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date();
    yesterday.setUTCHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    const currentMonthPreviews = await ExpenseModel.aggregate([
      {
        $facet: {
          month: [
            {
              $match: {
                incurredOn: { $gte: firstDay, $lt: lastDay },
                recordedBy: Types.ObjectId(userId),
              },
            },
            {
              $group: { _id: 'month', totalSpent: { $sum: '$amount' } },
            },
          ],
          today: [
            {
              $match: {
                incurredOn: { $gte: today, $lt: tomorrow },
                recordedBy: Types.ObjectId(userId),
              },
            },
            {
              $group: { _id: 'today', totalSpent: { $sum: '$amount' } },
            },
          ],
          yesterday: [
            {
              $match: {
                incurredOn: { $gte: yesterday, $lt: today },
                recordedBy: Types.ObjectId(userId),
              },
            },
            {
              $group: { _id: 'yesterday', totalSpent: { $sum: '$amount' } },
            },
          ],
        },
      },
    ]);

    return currentMonthPreviews;
  }

  async expensesByCategory(userId: string): Promise<any> {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    const categoryExpAggregates = await ExpenseModel.aggregate([
      {
        $facet: {
          average: [
            { $match: { recordedBy: Types.ObjectId(userId) } },
            {
              $group: {
                _id: {
                  category: '$category',
                  month: { $month: '$incurredOn' },
                },
                totalSpent: { $sum: '$amount' },
              },
            },
            {
              $group: {
                _id: '$_id.category',
                avgSpent: { $avg: '$totalSpent' },
              },
            },
            {
              $project: { _id: '$_id', value: { average: '$avgSpent' } },
            },
          ],
          total: [
            {
              $match: {
                incurredOn: { $gte: firstDay, $lt: lastDay },
                recordedBy: Types.ObjectId(userId),
              },
            },
            {
              $group: { _id: '$category', totalSpent: { $sum: '$amount' } },
            },
            {
              $project: { _id: '$_id', value: { total: '$totalSpent' } },
            },
          ],
        },
      },
      {
        $project: { overview: { $setUnion: ['$average', '$total'] } },
      },
      { $unwind: '$overview' },
      { $replaceRoot: { newRoot: '$overview' } },
      { $group: { _id: '$_id', mergedValues: { $mergeObjects: '$value' } } },
    ]);

    return categoryExpAggregates;
  }

  /**
   * @param userId
   * @param period
   * @returns
   * Total expenditure by date for a specific month
   */
  async scatteredPlotExpData(userId: string, period: Date): Promise<any> {
    const date = new Date(period);
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    const plotData = await ExpenseModel.aggregate([
      {
        $match: {
          incurredOn: { $gte: firstDay, $lt: lastDay },
          recordedBy: Types.ObjectId(userId),
        },
      },
      { $project: { x: { daysOfMonth: '$incurredOn' }, y: '$amount' } },
    ]);

    return plotData;
  }

  /**
   *
   * @param userId
   * @param year
   * @returns
   * Annual total monthly expenditure
   */
  async annualExpData(userId: string, year: number): Promise<any> {
    const y = year;
    const firstDay = new Date(y, 0, 1);
    const lastDay = new Date(y, 12, 0);

    const monthlyTotals = await ExpenseModel.aggregate([
      {
        $match: {
          incurredOn: { $gte: firstDay, $lt: lastDay },
          recordedBy: Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: { $month: '$incurredOn' },
          totalSpent: { $sum: '$amount' },
        },
      },
      {
        $project: { x: '$_id', y: '$totalSpent' },
      },
    ]);

    return monthlyTotals;
  }

  /**
   *
   * @param userId
   * @param startDate
   * @param endDate
   * @returns
   * Average total expenditure by category for the specified period
   */
  async avgExpBycategory(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const firstDay = new Date(startDate);
    const lastDay = new Date(endDate);

    const avgerageExpByCategory = await ExpenseModel.aggregate([
      {
        $match: {
          incurredOn: { $gte: firstDay, $lte: lastDay },
          recordedBy: Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: { category: '$category' },
          totalSpent: { $sum: '$amount' },
        },
      },
      {
        $group: { _id: '$_id.category', avgSpent: { $avg: '$totalSpent' } },
      },
      {
        $project: { x: '$_id', y: '$avgSpent' },
      },
    ]);

    return avgerageExpByCategory;
  }
}
