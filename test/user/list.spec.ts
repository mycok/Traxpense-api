import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture from './fixtures';
import { expect, chaiWithHttp } from '..';

const baseUrl = '/api/v1';
describe('list all users', () => {
  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({});
  });

  const app = new Application();
  describe('when a request is made to list all the available users', () => {
    it('an empty list is returned since there are no users', async () => {
      const res = await chaiWithHttp.request(app.app).get(`${baseUrl}/users`);

      expect(res.status).to.be.equal(200);
      expect(res.body.users.length).to.be.equal(0);
    });
  });

  describe('when a request is made to list all the available users', () => {
    beforeEach(async () => {
      await MongooseAccess.mongooseConnection.models.User.create(
        UserModelFixture.validUserObject,
      );
    });
    it('a list of users is returned', async () => {
      const res = await chaiWithHttp.request(app.app).get(`${baseUrl}/users`);

      expect(res.status).to.be.equal(200);
      expect(res.body.users.length).to.be.equal(1);
      expect(res.body.users[0]).to.have.property(
        'email',
        'somerandomemail@test.now',
      );
    });
  });
});
