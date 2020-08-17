import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, previewExpenses, createExpense } from './fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('preview expenses', () => {
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

  describe('when a request is made to preview expenses for the current month', () => {
    it('an aggregated expenses response should be returned', async () => {
      const res = await previewExpenses(app, baseUrl, result.body.token);

      expect(res.status).to.be.equal(200);
    });
  });
});
