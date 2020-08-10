import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { deleteUser, expect, chaiWithHttp } from './fixtures';
import { IUserDocument } from '../../server/database/data-abstracts/user/IUserDocument';
import { generateToken } from '../../utils/authUtils';

const baseUrl = '/api/v1';
describe('delete user by id', () => {
  let user: IUserDocument;
  let token: string;

  before(async () => {
    user = await MongooseAccess.mongooseConnection.models.User.create(
      UserModelFixture.validUserObject,
    );

    token = generateToken(user._id, user.username, user.email);
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({});
  });

  const app = new Application();

  describe('when a user sends a delete request without an auth header', () => {
    it('an un-authorized error should be returned', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .delete(`${baseUrl}/users/${user._id}`)
        .set('Accept', 'application/json')
        .send(UserModelFixture.validUpdateObject);

      expect(res.status).to.be.equal(401);
    });
  });

  describe('when a user sends a delete request with an invalid auth header', () => {
    it('a bad request error should be returned', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .delete(`${baseUrl}/users/${user._id}`)
        .set('Accept', 'application/json')
        .set('authorization', `Bear ${token}`)
        .send(UserModelFixture.validUpdateObject);

      expect(res.status).to.be.equal(400);
    });
  });
  describe('when a user sends a delete request without an auth token', () => {
    it('a bad request error should be returned', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .delete(`${baseUrl}/users/${user._id}`)
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ')
        .send(UserModelFixture.validUpdateObject);

      expect(res.status).to.be.equal(400);
    });
  });

  describe('when a user sends a delete request with a valid userId', () => {
    it('the specified user object should be successfully deleted', async () => {
      const res = await deleteUser(app, baseUrl, user.id, token);

      expect(res.status).to.be.equal(200);
    });
  });
});
