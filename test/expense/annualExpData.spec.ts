import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, aggExpenses, createExpense } from './fixtures';
import { createCategory, validCategoryObject } from '../category/fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('annual expense data', () => {
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

  describe('when a request is made to view annual expenses data aggregated by month and amount', () => {
    it('an aggregated expenses response should be returned', async () => {
      const year = new Date(expense?.body?.expense?.incurredOn).getFullYear();
      const res = await aggExpenses(
        app,
        `${baseUrl}/expenses/annual/?year=${year}`,
        userResult.body.token,
      );

      expect(res.status).to.be.equal(200);
    });
  });
});
