import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { updateUser } from './fixtures';
import { expect } from '..';
import { IUserDocument } from '../../server/database/data-abstracts/user/IUserDocument';
import { generateToken } from '../../utils/authUtils';

const baseUrl = '/api/v1';
describe('update user', () => {
  const app = new Application();
  let user: IUserDocument;
  let token: string;

  before(async () => {
    user = await MongooseAccess.mongooseConnection.models.User.create(
      UserModelFixture.validUserObject,
    );

    token = generateToken(user._id, user.username, user.email);
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({}).then(async () => {
      await MongooseAccess.close();
    });
  });

  describe('when a user sends an update request with valid properties', () => {
    it('the specified user object should be successfully updated', async () => {
      const res = await updateUser(
        app,
        baseUrl,
        UserModelFixture.validUpdateObject,
        user.id,
        token,
      );

      expect(res.status).to.be.equal(200);
      expect(res.body.user).to.have.property('username', 'updateduser');
      expect(res.body.user).to.have.property('email', 'updatedemail@test.now');
    });
  });

  describe('when a user sends an update request with invalid properties', () => {
    it('the bad request error should be returned', async () => {
      const res = await updateUser(
        app,
        baseUrl,
        UserModelFixture.invalidUpdateObject,
        user.id,
        token,
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.message).to.be.equal(
        "The 'user.email' field must be a valid email",
      );
    });
  });

  describe('when a user sends an update request with duplicate username and or email', () => {
    it('a bad request error should be returned', async () => {
      const res = await updateUser(
        app,
        baseUrl,
        UserModelFixture.validUpdateObject,
        user.id,
        token,
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.duplicates).to.be.equal(2);
    });
  });
});
