import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { createUser } from '../user/fixtures';
import { validExpenseObject, createExpense } from './fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('create expense', () => {
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

  describe('when a request contains all the valid required properties', () => {
    it('an expense should be successfully recorded', async () => {
      const res = await createExpense(
        app,
        baseUrl,
        result.body.token,
        validExpenseObject,
      );

      expect(res.status).to.be.equal(201);
    });
  });

  describe('when a request contains all the invalid / missing required properties', () => {
    const expense = {
      amount: 23400,
      category: 'testing',
    };

    it('a bad request error should be returned', async () => {
      const res = await createExpense(app, baseUrl, result.body.token, expense);

      expect(res.status).to.be.equal(400);
    });
  });
});
