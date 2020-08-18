import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, aggExpenses, createExpense } from './fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('average expenditure data by category', () => {
  const app = new Application();
  let result: any;
  let expense: any;

  before(async () => {
    result = await createUser(app, baseUrl, UserModelFixture.validUserObject);
  });

  before(async () => {
    expense = await createExpense(
      app,
      baseUrl,
      result.body.token,
      validExpenseObject,
    );
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({}).then(
      async () => {
        await MongooseAccess.mongooseConnection.models.Expense.deleteMany({});
      },
    );
  });

  describe('when a request is made to view monthly average expense data for the specified period', () => {
    it('an aggregated expenses response should be returned', async () => {
      const startDate = new Date(expense.body.expense.incurredOn);
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDay() + 5,
      );
      const res = await aggExpenses(
        app,
        `${baseUrl}/expenses/category/averages/?startDate=${startDate}&endDate=${endDate}`,
        result.body.token,
      );

      expect(res.status).to.be.equal(200);
    });
  });
});
