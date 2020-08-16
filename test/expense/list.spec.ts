import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import {
  validExpenseObject,
  listExpenses,
  listExpensesWithQueryStrs,
} from './fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('list all expenses', () => {
  const app = new Application();
  let result: any;
  let cursor: string;
  let lastExpense: any;

  before(async () => {
    result = await createUser(app, baseUrl, UserModelFixture.validUserObject);
  });

  before(async () => {
    const expenses = Array(11).fill({
      ...validExpenseObject,
      recordedBy: result.body.user.id,
    });
    await MongooseAccess.mongooseConnection.models.Expense.create(expenses);
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({}).then(
      async () => {
        await MongooseAccess.mongooseConnection.models.Expense.deleteMany({});
      },
    );
  });

  describe('when a request is made to list all the available expenses', () => {
    it('a paginated expense list of 10 should be returned, that is if a user has more than 10 expense records', async () => {
      const res = await listExpenses(app, baseUrl, result.body.token);
      cursor = res.body.cursor;

      expect(res.status).to.be.equal(200);
      expect(res.body.expenses.length).to.be.equal(10);
      expect(res.body.hasNextPage).to.be.equal(true);
    });
  });

  describe('if the cursor filter provided', () => {
    it('a paginated expense list of not more than 10 should be returned starting from the cursor value', async () => {
      const query = `cursor=${cursor}`;
      const res = await listExpensesWithQueryStrs(
        app,
        baseUrl,
        result.body.token,
        query,
      );
      lastExpense = res.body.expenses[0];

      expect(res.status).to.be.equal(200);
      expect(res.body.hasNextPage).to.be.equal(false);
      expect(res.body.cursor).to.be.equal('done');
    });
  });

  describe('with the date filter provided', () => {
    it('a paginated expense list of not more than 10 should be returned inclusive of the startDate', async () => {
      const startDate = `${lastExpense.incurredOn}`;
      const query = `startDate=${startDate}&endDate=${startDate}`;
      const res = await listExpensesWithQueryStrs(
        app,
        baseUrl,
        result.body.token,
        query,
      );

      expect(res.status).to.be.equal(200);
    });
  });
});
