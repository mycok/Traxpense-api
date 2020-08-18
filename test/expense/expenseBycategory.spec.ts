import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, aggExpenses, createExpense } from './fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('aggregated expenses by category', () => {
  const app = new Application();
  let result: any;

  before(async () => {
    result = await createUser(app, baseUrl, UserModelFixture.validUserObject);
  });

  before(async () => {
    await createExpense(app, baseUrl, result.body.token, validExpenseObject);
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({}).then(
      async () => {
        await MongooseAccess.mongooseConnection.models.Expense.deleteMany({});
      },
    );
  });

  describe('when a request is made to view expenses aggregated by category for the current month', () => {
    it('an aggregated expenses response should be returned', async () => {
      const res = await aggExpenses(
        app,
        `${baseUrl}/expenses/current`,
        result.body.token,
      );

      expect(res.status).to.be.equal(200);
    });
  });
});
