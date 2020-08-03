/**
 * @jest-environment node
 */

import * as request from 'supertest';

import { Application } from '../../../server/app/Application';
import { MongooseAccess } from '../../../server/database/adaptors/MongoAccess';
import UserModelFixture from './fixtures';
import { IUserDocument } from '../../../server/database/data-abstracts/user/IUserDocument';

const baseUrl = '/api/v1';
describe('delete user by id', () => {
  let user: IUserDocument;

  beforeEach(async () => {
    user = await MongooseAccess.mongooseConnection.models.User.create(
      UserModelFixture.validUserObject,
    );
  }, 8000);

  beforeAll(async () => {
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
  describe('when a user sends a delete request with a valid userId', () => {
    it('the specified user object should be successfully deleted', async () => {
      const res = await UserModelFixture.deleteUser(
        request,
        app,
        baseUrl,
        user.id,
      );

      expect(res.status).toEqual(200);
    });
  });
});
