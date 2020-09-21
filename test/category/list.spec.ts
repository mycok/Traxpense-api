import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import {
  createCategory,
  listCategories,
  validCategoryObject,
} from './fixtures';
import UserModelFixture, { createUser } from '../user/fixtures';
import { expect } from '..';

const baseUrl = '/api/v1';
describe('list categories', () => {
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

  describe('when a request is made to fetch all categories', () => {
    beforeEach(async () => {
      await createCategory(
        app,
        baseUrl,
        userResult?.body?.token,
        validCategoryObject,
      );
    });
    it('all categories should be returned', async () => {
      const res = await listCategories(app, baseUrl, userResult?.body?.token);

      expect(res.status).to.be.equal(200);
      expect(res.body?.count).to.be.equal(1);
    });
  });
});
