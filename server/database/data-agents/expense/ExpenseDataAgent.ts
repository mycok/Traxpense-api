/* eslint-disable max-len */
import { Types } from 'mongoose';

import { IExpenseDocument, ExpenseModel } from '../../data-abstracts';
import { BaseDataAgent } from '../BaseDataAgent';
import { IDataAgent } from '../DataAgent';

type DateRangeSearchParams = {
  userId: string;
  limit: number;
  startDate?: Date;
  endDate?: Date;
  cursor?: Date;
};

type CurrentMonthExpPreviewAggregate = {
  _id: string;
  totalSpent: number;
};

type CurrentMonthExpPreviewReturnType = [
  {
    month: CurrentMonthExpPreviewAggregate[] | [];
    today: CurrentMonthExpPreviewAggregate[] | [];
    yesterday: CurrentMonthExpPreviewAggregate[] | [];
  }
];

type TotalExpBycategoryForPeriodAggregate = {
  x: string;
  y: number;
  count: number;
};

type TotalExpBycategoryForPeriodReturnType = TotalExpBycategoryForPeriodAggregate[] | [];

type AnnualExpDataAggregate = {
  x: number;
  y: number;
  count: number;
};

type AnnualExpDataReturnType = AnnualExpDataAggregate[] | [];

type ScatteredPlotExpDataAggregate = {
  x: number;
  y: number;
};

type ScatteredPlotExpDataReturnType = ScatteredPlotExpDataAggregate[] | [];

type CurrentMonthAvgTotalExpByCategoryAggregate = {
  _id: string;
  mergedValues: {
    average: number;
    total: number;
  };
};

type CurrentMonthAvgTotalExpByCategoryReturnType =
  | CurrentMonthAvgTotalExpByCategoryAggregate[]
  | [];

export interface IExpenseDataAgent extends IDataAgent<IExpenseDocument> {
  currentMonthExpPreview(userId: string): Promise<CurrentMonthExpPreviewReturnType>;
  currentMonthAvgTotalExpByCategory(
    userId: string
  ): Promise<CurrentMonthAvgTotalExpByCategoryReturnType>;
  scatteredPlotExpData(
    userId: string,
    period: Date
  ): Promise<ScatteredPlotExpDataReturnType>;
  annualExpData(userId: string, year: number): Promise<AnnualExpDataReturnType>;
  totalExpBycategoryForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TotalExpBycategoryForPeriodReturnType>;
}

// TODO: add error handling for all aggregate data handlers
export class ExpenseDataAgent extends BaseDataAgent<IExpenseDocument> {
  constructor() {
    super(ExpenseModel);
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
    const user = Types.ObjectId(userId);

    const fromDate = startDate && new Date(startDate).toISOString();
    const toDate = endDate && new Date(endDate).toISOString();

    let query: any = { $and: [{ recordedBy: user }] };

    if (fromDate && toDate) {
      query = {
        $and: [{ recordedBy: user }, { incurredOn: { $gte: fromDate, $lte: toDate } }],
      };
    }

    if (cursor) {
      query = {
        $and: [{ recordedBy: user }, { incurredOn: { $lt: cursor } }],
      };
    }

    if (fromDate && toDate && cursor) {
      query = {
        $and: [
          { recordedBy: user },
          { incurredOn: { $gte: fromDate, $lte: toDate } },
          { incurredOn: { $lt: cursor } },
        ],
      };
    }

    const expenses: IExpenseDocument[] = await this.model
      .find(query)
      .populate('recordedBy', 'username email')
      .populate('category', '_id title')
      .limit(limit + 1)
      .sort({ incurredOn: -1 })
      .select('_id title amount category notes incurredOn createdAt');

    return expenses;
  }

  async getById(expId: string): Promise<IExpenseDocument | null> {
    const result = await this.model
      .findById(Types.ObjectId(expId))
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
  async currentMonthExpPreview(
    userId: string,
  ): Promise<CurrentMonthExpPreviewReturnType> {
    const user = Types.ObjectId(userId);

    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    const currentMonthExpenditurePreview = await this.model.aggregate([
      {
        $facet: {
          month: [
            {
              $match: {
                incurredOn: { $gte: firstDay, $lt: lastDay },
                recordedBy: user,
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
                recordedBy: user,
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
                recordedBy: user,
              },
            },
            {
              $group: { _id: 'yesterday', totalSpent: { $sum: '$amount' } },
            },
          ],
        },
      },
    ]);

    return currentMonthExpenditurePreview as CurrentMonthExpPreviewReturnType;
  }

  /**
   * @param userId
   * @returns
   *  Data of the expenses per category incurred so far in the current month
   *  grouped as average and total.
   */

  // TODO: Add option to query average expenditure per month and year.
  async currentMonthAvgTotalExpByCategory(
    userId: string,
  ): Promise<CurrentMonthAvgTotalExpByCategoryReturnType> {
    const user = Types.ObjectId(userId);

    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    const currentMonthAvgTotalExpenditureByCategory: CurrentMonthAvgTotalExpByCategoryReturnType = await this.model.aggregate(
      [
        {
          $facet: {
            average: [
              { $match: { recordedBy: user } },
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
                  recordedBy: user,
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
      ],
    );

    return currentMonthAvgTotalExpenditureByCategory;
  }

  /**
   * @param userId
   * @param period
   * @returns
   * Total expenditure by date for a specific month
   */
  async scatteredPlotExpData(
    userId: string,
    period: Date,
  ): Promise<ScatteredPlotExpDataReturnType> {
    const user = Types.ObjectId(userId);

    const date = new Date(period);
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const firstDay = new Date(y, m, d);
    const lastDay = new Date(y, m + 1, d);

    const plotData: ScatteredPlotExpDataReturnType = await this.model.aggregate([
      {
        $match: {
          incurredOn: { $gte: firstDay, $lt: lastDay },
          recordedBy: user,
        },
      },
      { $project: { _id: 0, x: { $dayOfMonth: '$incurredOn' }, y: '$amount' } },
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
  async annualExpData(userId: string, year: number): Promise<AnnualExpDataReturnType> {
    const user = Types.ObjectId(userId);

    const y = year;
    const firstDay = new Date(y, 0, 1);
    const lastDay = new Date(y, 12, 0);

    const annualExpenditureData: AnnualExpDataReturnType = await this.model.aggregate([
      {
        $match: {
          incurredOn: { $gte: firstDay, $lt: lastDay },
          recordedBy: user,
        },
      },
      {
        $group: {
          // Group the matched documents based on the incurredOn expense field.
          _id: { $month: '$incurredOn' },
          totalSpent: { $sum: '$amount' },
          expCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          x: '$_id',
          y: '$totalSpent',
          count: '$expCount',
        },
      },
    ]);

    return annualExpenditureData;
  }

  /**
   *
   * @param userId
   * @param startDate
   * @param endDate
   * @returns
   * Average total expenditure by category for the specified period
   */
  async totalExpBycategoryForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TotalExpBycategoryForPeriodReturnType> {
    const user = Types.ObjectId(userId);

    const firstDay = new Date(startDate);
    const lastDay = new Date(endDate);

    const totalExpByCategory: TotalExpBycategoryForPeriodReturnType = await this.model.aggregate(
      [
        {
          $match: {
            incurredOn: { $gte: firstDay, $lte: lastDay },
            recordedBy: user,
          },
        },
        {
          $group: {
            _id: { category: '$category' },
            totalSpent: { $sum: '$amount' },
            expCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            x: '$_id.category',
            y: '$totalSpent',
            count: '$expCount',
          },
        },
      ],
    );

    return totalExpByCategory;
  }
}
