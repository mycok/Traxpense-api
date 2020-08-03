/**
 * @jest-environment node
 */

import * as request from 'supertest';

import { Application } from '../../../server/app/Application';
import { MongooseAccess } from '../../../server/database/adaptors/MongoAccess';
import UserModelFixture from './fixtures';

const baseUrl = '/api/v1';
describe('list all users', () => {
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
  describe('when a request is made to list all the available users', () => {
    it('an empty list is returned since there are no users', async () => {
      const res = await request.agent(app.app).get(`${baseUrl}/users`);

      expect(res.status).toEqual(200);
      expect(res.body.users.length).toEqual(0);
    });
  });

  describe('when a request is made to list all the available users', () => {
    beforeEach(async () => {
      await MongooseAccess.mongooseConnection.models.User.create(
        UserModelFixture.validUserObject,
      );
    });
    it('a list of users is returned', async () => {
      const res = await request.agent(app.app).get(`${baseUrl}/users`);

      expect(res.status).toEqual(200);
      expect(res.body.users.length).toEqual(1);
      expect(res.body.users[0]).toHaveProperty(
        'email',
        'somerandomemail@test.now',
      );
    });
  });
});
