import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, listExpenses, createExpense } from './fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('list all expenses', () => {
  const app = new Application();
  let result: any;

  before(async () => {
    result = await createUser(app, baseUrl, UserModelFixture.validUserObject);
  });
  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({}).then(
      async () => {
        await MongooseAccess.mongooseConnection.models.Expense.deleteMany({});
      },
    );
  });

  describe('when a request is made to list all the available expenses', () => {
    beforeEach(async () => {
      await createExpense(app, baseUrl, result.body.token, validExpenseObject);
    });
    it('all expenses should be returned', async () => {
      const res = await listExpenses(app, baseUrl, result.body.token);

      expect(res.status).to.be.equal(200);
      expect(res.body.expenses.length).to.be.equal(1);
    });
  });
});
