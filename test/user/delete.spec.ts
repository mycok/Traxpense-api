import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { deleteUser } from './fixtures';
import { expect, chaiWithHttp } from '..';
import { IUserDocument } from '../../server/database/data-abstracts/user/IUserDocument';
import { generateToken } from '../../utils/authUtils';

const baseUrl = '/api/v1';
describe('delete user', () => {
  let user: IUserDocument;
  let user1: IUserDocument;
  let token: string;

  before(async () => {
    const users = [
      UserModelFixture.validUserObject,
      {
        username: 'test-user2',
        email: 'testemail2@gmail.com',
        password: 'passWord#23',
      },
    ];
    const usersData = await MongooseAccess.mongooseConnection.models.User.create(
      users,
    );
    user = usersData[0];
    user1 = usersData[1];
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
        .set('Accept', 'application/json');

      expect(res.status).to.be.equal(401);
    });
  });

  describe('when a user sends a delete request with an invalid auth header', () => {
    it('a bad request error should be returned', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .delete(`${baseUrl}/users/${user._id}`)
        .set('Accept', 'application/json')
        .set('authorization', `Bear ${token}`);

      expect(res.status).to.be.equal(400);
    });
  });
  describe('when a user sends a delete request without an auth token', () => {
    it('a bad request error should be returned', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .delete(`${baseUrl}/users/${user._id}`)
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer ');

      expect(res.status).to.be.equal(400);
    });
  });

  describe('when user tries to delete another user other than himself', () => {
    it('a forbidden error should be returned', async () => {
      const res = await deleteUser(app, baseUrl, user1.id, token);

      expect(res.status).to.be.equal(403);
      expect(res.body.message).to.be.equal(
        'You are not authorized to perform this action',
      );
    });
  });

  describe('when a user sends a delete request to delete himself', () => {
    it('he should be successfully deleted', async () => {
      const res = await deleteUser(app, baseUrl, user.id, token);

      expect(res.status).to.be.equal(200);
    });
  });
});
