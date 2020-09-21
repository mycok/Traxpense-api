import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import { createCategory, validCategoryObject } from './fixtures';
import UserModelFixture, { createUser } from '../user/fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('create category', () => {
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
        await MongooseAccess.mongooseConnection.models.Category.deleteMany({});
      },
    );
  });

  describe('when a request is made to create a new category with a valid title field', () => {
    it('a new category should be returned', async () => {
      const res = await createCategory(
        app,
        baseUrl,
        userResult?.body?.token,
        validCategoryObject,
      );

      expect(res.status).to.be.equal(201);
      expect(res.body?.category?.title).to.be.equal('laptops');
    });
  });

  describe('when a request is made to create a new category with an invalid title field', () => {
    it('a bad request error should be returned', async () => {
      const res = await createCategory(app, baseUrl, userResult?.body?.token, {
        ...validCategoryObject,
        title: 'l',
      });

      expect(res.status).to.be.equal(400);
      expect(res.body?.message).to.be.equal(
        'Category name must contain atleast 2 characters',
      );
    });
  });
});
