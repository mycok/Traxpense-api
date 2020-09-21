import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, createExpense } from './fixtures';
import { createCategory, validCategoryObject } from '../category/fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('create expense', () => {
  const app = new Application();
  let userResult: any;

  before(async () => {
    userResult = await createUser(
      app,
      baseUrl,
      UserModelFixture.validUserObject,
    );
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({}).then(
      async () => {
        await MongooseAccess.mongooseConnection.models.Expense.deleteMany(
          {},
        ).then(async () => {
          await MongooseAccess.mongooseConnection.models.Category.deleteMany(
            {},
          );
        });
      },
    );
  });

  describe('when a request contains all the valid required properties', () => {
    let categoryResult: any;

    beforeEach(async () => {
      categoryResult = await createCategory(
        app,
        baseUrl,
        userResult?.body?.token,
        validCategoryObject,
      );
    });
    it('an expense should be successfully recorded', async () => {
      const res = await createExpense(app, baseUrl, userResult?.body?.token, {
        ...validExpenseObject,
        category: categoryResult?.body?.category,
      });

      expect(res.status).to.be.equal(201);
    });
  });

  describe('when a request contains invalid / missing required properties', () => {
    const expense = {
      amount: 23400,
      category: { _id: '73884440847474933', title: 'test-category' },
    };

    it('a bad request error should be returned', async () => {
      const res = await createExpense(
        app,
        baseUrl,
        userResult.body.token,
        expense,
      );

      expect(res.status).to.be.equal(400);
    });
  });
});
