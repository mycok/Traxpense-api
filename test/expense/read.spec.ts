import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, read, createExpense } from './fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('read expense', () => {
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

  describe('when a request is made to list a specific expense by providing a valid expense id', () => {
    it('an expense matching the provided id should be returned', async () => {
      const res = await read(
        app,
        baseUrl,
        result.body.token,
        expense.body.expense._id,
      );

      expect(res.status).to.be.equal(200);
    });
  });

  describe('when a request is made to list a specific expense with a non existing expense id', () => {
    before(async () => {
      await MongooseAccess.mongooseConnection.models.Expense.deleteOne({
        _id: expense.body.expense._id,
      });
    });

    it('a not found error should be returned', async () => {
      const res = await read(
        app,
        baseUrl,
        result.body.token,
        expense.body.expense._id,
      );

      expect(res.status).to.be.equal(404);
      expect(res.body.message).to.be.equal('Expense not found');
    });
  });
});
