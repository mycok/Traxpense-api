import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, updateExpense, createExpense } from './fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('update expense', () => {
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

  describe('when a request is made to update a specific expense by providing a valid expense id', () => {
    it('an updated expense matching the provided id should be returned', async () => {
      const res = await updateExpense(
        app,
        baseUrl,
        result.body.token,
        expense.body.expense.id,
        { title: 'updated-expense' },
      );

      expect(res.status).to.be.equal(200);
    });
  });

  describe('when a request is made to update a specific expense with one or more invalid properties', () => {
    it('a bad request error should be returned', async () => {
      const res = await updateExpense(
        app,
        baseUrl,
        result.body.token,
        expense.body.expense.id,
        { title: 456 },
      );

      expect(res.status).to.be.equal(400);
    });
  });
});
