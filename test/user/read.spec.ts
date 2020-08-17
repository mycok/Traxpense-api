import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import { IUserDocument } from '../../server/database/data-abstracts/user/IUserDocument';
import UserModelFixture from './fixtures';
import { expect, chaiWithHttp } from '..';
import { generateToken } from '../../utils/authUtils';

const baseUrl = '/api/v1';
describe('read user', () => {
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
  describe('when a request is made to fetch a user by the provided id', () => {
    it('a user matching the provided id should be successfully retrieved', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .get(`${baseUrl}/users/${user.id}`)
        .set('authorization', `Bearer ${token}`);

      expect(res.status).to.be.equal(200);
      expect(res.body.user.id).to.be.equal(user.id);
    });
  });

  describe('when a request is made to fetch a user by providing a non existing id', () => {
    beforeEach(async () => {
      user = await MongooseAccess.mongooseConnection.models.User.findByIdAndDelete(
        user.id,
      );
    });
    it("a 'Not Found' error should be returned", async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .get(`${baseUrl}/users/${user.id}`);

      expect(res.status).to.be.equal(404);
      expect(res.body.message).to.be.equal('User not found');
    });
  });
});
