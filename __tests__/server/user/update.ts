/**
 * @jest-environment node
 */

import * as request from 'supertest';

import { Application } from '../../../server/app/Application';
import { MongooseAccess } from '../../../server/database/adaptors/MongoAccess';
import UserModelFixture from './fixtures';
import { IUserDocument } from '../../../server/database/data-abstracts/user/IUserDocument';

const baseUrl = '/api/v1';
describe('update user', () => {
  let user: IUserDocument;

  beforeEach(async () => {
    user = await MongooseAccess.mongooseConnection.models.User.create(
      UserModelFixture.validUserObject,
    );
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
  describe('when a user sends an update request with valid properties', () => {
    afterEach(async () => {
      await MongooseAccess.mongooseConnection.models.User.deleteMany({});
    });

    it('the specified user object should be successfully updated', async () => {
      const res = await UserModelFixture.updateUser(
        request,
        app,
        baseUrl,
        UserModelFixture.validUpdateObject,
        user.id,
      );

      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty('user.username', 'updateduser');
      expect(res.body).toHaveProperty('user.email', 'updatedemail@test.now');
    });
  });

  describe('when a user sends an update request with invalid properties', () => {
    it('the bad request error should be returned', async () => {
      const res = await UserModelFixture.updateUser(
        request,
        app,
        baseUrl,
        UserModelFixture.invalidUpdateObject,
        user.id,
      );

      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(
        "The 'user.email' field must be a valid email",
      );
    });
  });

  // describe('when a user sends an update request with duplicate username and or email', () => {
  //   it('a bad request error should be returned', async () => {
  //     const res = await UserModelFixture.updateUser(
  //       request, app, baseUrl, UserModelFixture.validUpdateObject,
  //       user.id,
  //     );

  //     expect(res.status).toEqual(400);
  //     expect(res.body.duplicates).toEqual(2);
  //   });
  // });
});
