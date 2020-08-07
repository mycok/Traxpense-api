import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { deleteUser, expect } from './fixtures';
import { IUserDocument } from '../../server/database/data-abstracts/user/IUserDocument';

const baseUrl = '/api/v1';
describe('delete user by id', () => {
  let user: IUserDocument;

  beforeEach(async () => {
    user = await MongooseAccess.mongooseConnection.models.User.create(
      UserModelFixture.validUserObject,
    );
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({});
  });

  const app = new Application();
  describe('when a user sends a delete request with a valid userId', () => {
    it('the specified user object should be successfully deleted', async () => {
      const res = await deleteUser(app, baseUrl, user.id);

      expect(res.status).to.be.equal(200);
    });
  });
});
