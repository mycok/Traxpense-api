/**
 * @jest-environment node
 */

import * as request from 'supertest';

import { Application } from '../../../server/app/Application';
import { MongooseAccess } from '../../../server/database/adaptors/MongoAccess';
import { IUserDocument } from '../../../server/database/data-abstracts/user/IUserDocument';
import UserModelFixture from './fixtures';

const baseUrl = '/api/v1';
describe('read user by id', () => {
  let user: IUserDocument;

  beforeEach(async () => {
    user = await MongooseAccess.mongooseConnection.models.User.create(
      UserModelFixture.validUserObject,
    );
  });

  afterEach(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({});
  });

  beforeAll(() => {
    MongooseAccess.connect(process.env.TEST_MONGODB_URI);
  });

  afterAll(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({}).then(
      async () => {
        await MongooseAccess.close();
      },
    );
  }, 8000);

  const app = new Application();
  describe('when a request is made to fetch a user by the provided id', () => {
    it('a user matching the provided id should be successfully retrieved', async () => {
      const res = await request
        .agent(app.app)
        .get(`${baseUrl}/users/${user.id}`);

      expect(res.status).toEqual(200);
      expect(res.body.user._id).toEqual(user.id);
    });
  });

  describe('when a request is made to fetch a user by providing a non existing id', () => {
    beforeEach(async () => {
      user = await MongooseAccess.mongooseConnection.models.User.findByIdAndDelete(
        user.id,
      );
    });
    it("a 'Not Found' error should be returned", async () => {
      const res = await request
        .agent(app.app)
        .get(`${baseUrl}/users/${user.id}`);

      expect(res.status).toEqual(404);
      expect(res.body.message).toEqual('User Not Found');
    });
  });
});
