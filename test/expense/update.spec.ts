import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, updateExpense, createExpense } from './fixtures';
import { createCategory, validCategoryObject } from '../category/fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('update expense', () => {
  const app = new Application();
  let userResult: any;
  let categoryResult: any;
  let expense: any;

  before(async () => {
    userResult = await createUser(app, baseUrl, UserModelFixture.validUserObject);
  });

  before(async () => {
    categoryResult = await createCategory(
      app,
      baseUrl,
      userResult?.body?.token,
      validCategoryObject,
    );
  });

  before(async () => {
    expense = await createExpense(app, baseUrl, userResult.body.token, {
      ...validExpenseObject,
      category: { _id: categoryResult?.body?.category?._id },
    });
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({}).then(async () => {
      await MongooseAccess.mongooseConnection.models.Expense.deleteMany({}).then(
        async () => {
          await MongooseAccess.mongooseConnection.models.Category.deleteMany({});
        },
      );
    });
  });

  describe('when a request is made to update a specific expense by providing a valid expense id', () => {
    it('an updated expense matching the provided id should be returned', async () => {
      const res = await updateExpense(
        app,
        baseUrl,
        userResult.body.token,
        expense?.body?.expense?._id,
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
        userResult.body.token,
        expense?.body?.expense?._id,
        { title: 456 },
      );

      expect(res.status).to.be.equal(400);
    });
  });
});
