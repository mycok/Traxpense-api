import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { updateUser, expect } from './fixtures';
import { IUserDocument } from '../../server/database/data-abstracts/user/IUserDocument';

const baseUrl = '/api/v1';
describe('update user', () => {
  let user: IUserDocument;

  before(async () => {
    user = await MongooseAccess.mongooseConnection.models.User.create(
      UserModelFixture.validUserObject,
    );
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({}).then(
      async () => {
        await MongooseAccess.close();
      },
    );
  });

  const app = new Application();
  describe('when a user sends an update request with valid properties', () => {
    it('the specified user object should be successfully updated', async () => {
      const res = await updateUser(
        app,
        baseUrl,
        UserModelFixture.validUpdateObject,
        user.id,
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
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.duplicates).to.be.equal(2);
    });
  });
});
