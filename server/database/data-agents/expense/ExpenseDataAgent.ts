import { Types } from 'mongoose';

import { IExpenseDocument, ExpenseModel } from '../../data-abstracts';
import { BaseDataAgent } from '../../../../utils/BaseDataAgent';

type DateRangeSearchParams = {
  userId: string;
  limit: number;
  startDate?: Date;
  endDate?: Date;
  cursor?: Date;
};

// TODO: add error handling for all aggregate data handlers
export class ExpenseDataAgent extends BaseDataAgent<IExpenseDocument> {
  private _expenseModel: any;

  constructor() {
    super(ExpenseModel);
    this._expenseModel = ExpenseModel;
  }
  /**
   * Uses cursor based pagination along with a date filter to return
   a paginated list filtered by date, ordered by _id and in a descending order.

   * The cursor filter is based on the same predicate as the sort filter,
    that is if cursor is in descending order, then the sort filter follows suit.

   * TODO: - add protection for querying other user's expenses
    by sending a query without any filters
   */

  async list({
    userId,
    limit,
    startDate,
    endDate,
    cursor,
  }: DateRangeSearchParams): Promise<IExpenseDocument[]> {
    const firstDay = startDate && new Date(startDate).toISOString();
    const lastDay = endDate && new Date(endDate).toISOString();

    let query: any = { $and: [{ recordedBy: userId }] };

    if (firstDay && lastDay) {
      query = {
        $and: [{ recordedBy: userId }, { incurredOn: { $gte: firstDay, $lte: lastDay } }],
      };
    }

    if (cursor) {
      query = {
        $and: [{ recordedBy: userId }, { incurredOn: { $lt: cursor } }],
      };
    }

    if (firstDay && lastDay && cursor) {
      query = {
        $and: [
          { recordedBy: userId },
          { incurredOn: { $gte: firstDay, $lte: lastDay } },
          { incurredOn: { $lt: cursor } },
        ],
      };
    }

    const expenses: IExpenseDocument[] = await this._expenseModel
      .find(query)
      .populate('recordedBy', 'username email')
      .populate('category', '_id title')
      .limit(limit + 1)
      .sort({ incurredOn: -1 })
      .select('_id title amount category notes incurredOn createdAt');

    return expenses;
  }

  async getById(expId: string): Promise<IExpenseDocument | null> {
    const result = await this._expenseModel
      .findById(expId)
      .populate('recordedBy')
      .populate('category', '_id title');

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

    const currentMonthPreviews = await this._expenseModel.aggregate([
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

    const categoryExpAggregates = await this._expenseModel.aggregate([
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
                incurredOn: { $gte: firstDay, $lte: lastDay },
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

    const plotData = await this._expenseModel.aggregate([
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

    const monthlyTotals = await this._expenseModel.aggregate([
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
  async avgExpBycategory(userId: string, startDate: Date, endDate: Date): Promise<any> {
    const firstDay = new Date(startDate);
    const lastDay = new Date(endDate);

    const avgerageExpByCategory = await this._expenseModel.aggregate([
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
